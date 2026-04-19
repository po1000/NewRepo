import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown, Globe, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface UserProfileProps {
  username: string;
  avatarUrl: string | null;
  userId: string;
  onAvatarChange?: (url: string) => void;
}

export function UserProfile({ username, avatarUrl, userId, onAvatarChange }: UserProfileProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { language, toggleLanguage, t, showInstructions, setShowInstructions } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(() => {
    const id = userId || localStorage.getItem('last_user_id');
    if (id) {
      // Try remote URL first, then base64 fallback
      const stored = localStorage.getItem(`avatar_url_${id}`);
      if (stored) return stored;
      const b64 = localStorage.getItem(`avatar_b64_${id}`);
      if (b64) return b64;
    }
    return avatarUrl;
  });
  const [imgKey, setImgKey] = useState(0);
  const [imgError, setImgError] = useState(false);

  // When userId becomes available (auth loaded), cache it and read stored avatar
  useEffect(() => {
    if (!userId) return;
    localStorage.setItem('last_user_id', userId);
    const stored = localStorage.getItem(`avatar_url_${userId}`)
      || localStorage.getItem(`avatar_b64_${userId}`);
    if (stored) {
      setLocalAvatarUrl(stored);
      setImgError(false);
    }
  }, [userId]);

  // Sync from parent prop when it becomes non-null (auth loaded with metadata URL)
  useEffect(() => {
    if (avatarUrl) {
      // Only override if we don't already have a localStorage value
      const stored = userId ? localStorage.getItem(`avatar_url_${userId}`) : null;
      if (!stored) {
        setLocalAvatarUrl(avatarUrl);
        setImgError(false);
      }
    }
  }, [avatarUrl, userId]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    setMenuOpen(false);

    // Immediately show preview via object URL
    const previewUrl = URL.createObjectURL(file);
    setLocalAvatarUrl(previewUrl);
    setImgKey(prev => prev + 1);

    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

    await supabase.auth.updateUser({
      data: { avatar_url: urlWithCacheBust },
    });

    // Persist both the remote URL and a base64 data URL to localStorage
    if (userId) {
      localStorage.setItem(`avatar_url_${userId}`, urlWithCacheBust);
      // Also store base64 as bulletproof fallback (works offline, no network needed)
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          localStorage.setItem(`avatar_b64_${userId}`, reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }

    // Swap from blob preview to real URL
    URL.revokeObjectURL(previewUrl);
    setLocalAvatarUrl(urlWithCacheBust);
    setImgError(false);
    setImgKey(prev => prev + 1);
    onAvatarChange?.(urlWithCacheBust);
    setUploading(false);

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const displayUrl = localAvatarUrl || avatarUrl;

  return (
    <div className="relative">
      {/* File input lives outside the menu so it persists */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        className="flex flex-row items-center gap-2 p-2 bg-white rounded-lg shadow-[2px_2px_4px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors"
        aria-label="User profile menu"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {displayUrl && !imgError ? (
          <img
            key={imgKey}
            src={displayUrl}
            alt="Profile"
            className="w-[25px] h-[25px] rounded-full object-cover flex-shrink-0"
            onError={() => {
              // If remote URL fails, try base64 fallback before showing initials
              const id = userId || localStorage.getItem('last_user_id');
              if (id && !imgError) {
                const b64 = localStorage.getItem(`avatar_b64_${id}`);
                if (b64 && localAvatarUrl !== b64) {
                  setLocalAvatarUrl(b64);
                  setImgKey(prev => prev + 1);
                  return;
                }
              }
              setImgError(true);
            }}
          />
        ) : (
          <div
            className="w-[25px] h-[25px] rounded-full bg-[#D9D9D9] flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <span className="font-inter font-bold text-[11px] text-[#372213]">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="font-inter font-semibold text-[13px] leading-[20px] text-[#372213]">
          {username}
        </span>
        <ChevronDown className="w-4 h-4 text-[#372213]" aria-hidden="true" />
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden">
            <button
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className="w-full text-left px-4 py-2.5 text-[13px] font-inter text-[#372213] hover:bg-gray-50 transition-colors"
            >
              {uploading ? t('ui.uploading') : t('ui.changePhoto')}
            </button>
            <button
              onClick={() => {
                navigate('/badges');
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-[13px] font-inter text-[#372213] hover:bg-gray-50 transition-colors border-t border-gray-50"
            >
              {t('ui.myBadges')}
            </button>

            {/* Interface Language */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#FF4D01]" />
                <span className="font-inter font-medium text-[13px] text-[#372213]">{t('settings.language')}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLanguage();
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-[#FF4D01] text-white hover:bg-[#E8451A] transition-colors"
              >
                {language === 'en' ? '🇬🇧 EN' : '🇪🇸 ES'}
              </button>
            </div>

            {/* Show Instructions */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#FF4D01]" />
                <span className="font-inter font-medium text-[13px] text-[#372213]">{t('settings.instructions')}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInstructions(!showInstructions);
                }}
                className={`relative w-9 h-5 rounded-full transition-colors ${showInstructions ? 'bg-[#22C55E]' : 'bg-[#D1D5DB]'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showInstructions ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <button
              onClick={() => {
                signOut();
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-[13px] font-inter text-[#E53E3E] hover:bg-red-50 transition-colors border-t border-gray-100"
            >
              {t('ui.signOut')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

import React, { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface UserProfileProps {
  username: string;
  avatarUrl: string | null;
  userId: string;
  onAvatarChange?: (url: string) => void;
}

export function UserProfile({ username, avatarUrl, userId, onAvatarChange }: UserProfileProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(avatarUrl);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
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

    // Add cache buster to force refresh
    const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

    await supabase.auth.updateUser({
      data: { avatar_url: urlWithCacheBust },
    });

    setLocalAvatarUrl(urlWithCacheBust);
    onAvatarChange?.(urlWithCacheBust);
    setUploading(false);
    setMenuOpen(false);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Use Google avatar if available and no custom avatar
  const displayUrl = localAvatarUrl || avatarUrl;

  return (
    <div className="relative">
      <button
        className="flex flex-row items-center gap-2 p-2 bg-white rounded-lg shadow-[2px_2px_4px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors"
        aria-label="User profile menu"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Profile"
            className="w-[25px] h-[25px] rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-[25px] h-[25px] rounded-full bg-[#D9D9D9] flex-shrink-0"
            aria-hidden="true"
          />
        )}
        <span className="font-inter font-semibold text-[13px] leading-[20px] text-[#372213]">
          {username}
        </span>
        <ChevronDown className="w-4 h-4 text-[#372213]" aria-hidden="true" />
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <>
          {/* Backdrop to close menu */}
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden">
            <button
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className="w-full text-left px-4 py-2.5 text-[13px] font-inter text-[#372213] hover:bg-gray-50 transition-colors"
            >
              {uploading ? 'Uploading...' : 'Change Profile Photo'}
            </button>
            <button
              onClick={() => {
                navigate('/badges');
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-[13px] font-inter text-[#372213] hover:bg-gray-50 transition-colors border-t border-gray-50"
            >
              My Badges
            </button>
            <button
              onClick={() => {
                signOut();
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-[13px] font-inter text-[#E53E3E] hover:bg-red-50 transition-colors border-t border-gray-100"
            >
              Sign Out
            </button>
          </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

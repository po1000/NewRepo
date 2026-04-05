import React, { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface UserProfileProps {
  username: string;
  avatarUrl: string | null;
  userId: string;
  onAvatarChange?: (url: string) => void;
}

export function UserProfile({ username, avatarUrl, userId, onAvatarChange }: UserProfileProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    // Upload to Supabase Storage (avatars bucket)
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update user metadata
    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    onAvatarChange?.(publicUrl);
    setUploading(false);
    setMenuOpen(false);
  }

  return (
    <div className="relative">
      <button
        className="flex flex-row items-center gap-2 p-2 bg-white rounded-lg shadow-[2px_2px_4px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors"
        aria-label="User profile menu"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
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
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden">
          <button
            onClick={() => {
              fileInputRef.current?.click();
              setMenuOpen(false);
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
        </div>
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

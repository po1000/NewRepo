import React from 'react';
import { ChevronDown } from 'lucide-react';
interface UserProfileProps {
  username: string;
}
export function UserProfile({ username }: UserProfileProps) {
  return (
    <button
      className="flex flex-row items-center gap-2 p-2 bg-white rounded-lg shadow-[2px_2px_4px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors"
      aria-label="User profile menu">
      
      <div
        className="w-[25px] h-[25px] rounded-full bg-[#D9D9D9] flex-shrink-0"
        aria-hidden="true" />
      
      <span className="font-inter font-semibold text-[13px] leading-[20px] text-[#372213]">
        {username}
      </span>
      <ChevronDown className="w-4 h-4 text-[#372213]" aria-hidden="true" />
    </button>);

}
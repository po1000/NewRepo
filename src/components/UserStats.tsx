import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Flame } from 'lucide-react';

interface UserStatsProps {
  xp: string;
  hearts: number;
  streak: number;
}

export function UserStats({ xp, hearts, streak }: UserStatsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-row gap-2 items-center">
      {/* XP Badge */}
      <div
        title="XP earned"
        className="flex flex-row items-center gap-1.5 px-3 py-2 bg-white rounded-xl shadow-[2px_2px_4px_rgba(0,0,0,0.06)]"
      >
        <Zap className="w-5 h-5 text-[#00B327] fill-[#00B327]" aria-hidden="true" />
        <span className="font-inter font-bold text-[13.6px] leading-[24px] text-[#00B327]">
          {xp}
        </span>
      </div>

      {/* Badges Badge — clickable */}
      <button
        title="Badges earned"
        onClick={() => navigate('/badges')}
        className="flex flex-row items-center gap-1.5 px-3 py-2 bg-white rounded-xl shadow-[2px_2px_4px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors"
      >
        <img
          src="/badges-icon.svg"
          alt="Badges"
          className="w-5 h-5"
          aria-hidden="true"
        />
        <span className="font-inter font-bold text-[13.6px] leading-[24px] text-[#0088E9]">
          {hearts}
        </span>
      </button>

      {/* Streak Badge */}
      <div
        title="Streak count"
        className="flex flex-row items-center gap-1.5 px-3 py-2 bg-white rounded-xl shadow-[2px_2px_4px_rgba(0,0,0,0.06)]"
      >
        <Flame className="w-5 h-5 text-[#FF2A2A] fill-[#FF2A2A]" aria-hidden="true" />
        <span className="font-inter font-bold text-[13.6px] leading-[24px] text-[#372213]">
          {streak}
        </span>
      </div>
    </div>
  );
}

import React from 'react';
import { Play } from 'lucide-react';
interface LessonCardProps {
  title: string;
  subtitle: string;
  xpReward: number;
  goalText: string;
  progressPercent: number;
}
export function LessonCard({
  title,
  subtitle,
  xpReward,
  goalText,
  progressPercent
}: LessonCardProps) {
  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-[16px] w-full max-w-[632px] mx-auto shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col">
          <h2 className="font-inter font-bold text-[15.3px] leading-[28px] text-[#372213]">
            {title}
          </h2>
          <p className="font-inter text-[11.9px] leading-[20px] text-[#372213]">
            {subtitle}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-inter text-[12px] leading-[16px] text-[#372213]">
            +{xpReward} XP Reward
          </span>
          <span className="font-inter font-medium text-[12px] leading-[20px] text-[#372213]">
            "{goalText}"
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="w-full h-2 bg-[#EBEBEB] rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}>
        
        <div
          className="h-full bg-[#FF4D01] rounded-full transition-all duration-500 ease-in-out"
          style={{
            width: `${progressPercent}%`
          }} />
        
      </div>

      {/* CTA Button */}
      <button className="flex flex-row items-center justify-center gap-2 w-full py-3 bg-[#FF4D01] hover:bg-[#e64500] transition-colors rounded-xl text-white font-inter font-bold text-[13.6px] leading-[24px]">
        <Play className="w-5 h-5 fill-current" aria-hidden="true" />
        Continue Lesson
      </button>
    </div>);

}
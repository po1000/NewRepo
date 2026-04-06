import React from 'react';
import { Check } from 'lucide-react';
export type LessonStatus = 'completed' | 'in-progress' | 'locked';
export interface LessonTileProps {
  unitNumber: string;
  title: string;
  color: string;
  imageUrl: string;
  status: LessonStatus;
  progressPercent?: number;
  subunitId?: number;
  goalText?: string;
  onClick?: () => void;
}
export function LessonTile({
  unitNumber,
  title,
  color,
  imageUrl,
  status,
  progressPercent = 50,
  onClick
}: LessonTileProps) {
  return (
    <div className="flex flex-col gap-1 w-[203px]" data-lesson-tile>
      <h4 className="font-inter font-semibold text-[16px] leading-[28px] text-[#372213] truncate">
        {title}
      </h4>

      <div
        className="relative w-[203px] h-[151px] rounded-lg overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
        style={{
          backgroundColor: color
        }}
        onClick={onClick}>
        
        {/* Unit Badge */}
        <div className="absolute top-2.5 left-2.5 z-10 bg-white rounded-lg shadow-[0px_4px_4px_rgba(0,0,0,0.1)] px-2 py-0.5 min-w-[36px] text-center">
          <span className="font-inter font-semibold text-[16px] leading-[28px] tracking-[1.3px] text-[#372213]">
            {unitNumber}
          </span>
        </div>

        {/* Illustration */}
        <div className="absolute inset-0 flex items-center justify-center p-4 pt-8">
          <img
            src={imageUrl}
            alt={`Illustration for ${title}`}
            className="w-full h-full object-contain" />
          
        </div>

        {/* Status Overlays */}
        {status === 'completed' &&
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <div className="w-[58px] h-[58px] rounded-full bg-[#09BD00] flex items-center justify-center shadow-lg">
              <Check
              className="w-8 h-8 text-white stroke-[3]"
              aria-hidden="true" />
            
            </div>
          </div>
        }

        {status === 'in-progress' &&
        <div className="absolute bottom-0 left-0 right-0 h-[12px] bg-white/30">
            <div
            className="h-full bg-white transition-all duration-500"
            style={{
              width: `${progressPercent}%`
            }} />

          </div>
        }
      </div>

      {/* Progress indicator below tile */}
      {status === 'in-progress' && (
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-[6px] bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, backgroundColor: color }}
            />
          </div>
          <span className="font-inter font-semibold text-[11px] text-[#6B7280] shrink-0">
            {progressPercent}%
          </span>
        </div>
      )}
    </div>);

}
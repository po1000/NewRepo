import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { LessonTile, LessonTileProps } from './LessonTile';
export interface UnitData {
  id: string;
  title: string;
  lessons: LessonTileProps[];
}
interface UnitSectionProps {
  level: string;
  currentUnit: string;
  units: UnitData[];
  defaultExpanded?: boolean;
}
export function UnitSection({
  level,
  currentUnit,
  units,
  defaultExpanded = true
}: UnitSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  return (
    <div className="flex flex-col w-full max-w-[632px] mx-auto bg-[#FF4D01] rounded-[16px] p-4 sm:p-5 transition-all duration-300">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex flex-row items-center justify-between w-full mb-4 group"
        aria-expanded={isExpanded}>
        
        <div className="flex flex-row items-center gap-3">
          <h2 className="font-inter font-bold text-[20.4px] leading-[32px] text-white">
            {level}
          </h2>
        </div>
        <div className="flex items-center justify-center w-[35px] h-[35px] rounded-full border-2 border-white bg-white/10 group-hover:bg-white/20 transition-colors">
          {isExpanded ?
          <ChevronDown className="w-5 h-5 text-white" aria-hidden="true" /> :

          <ChevronRight className="w-5 h-5 text-white" aria-hidden="true" />
          }
        </div>
      </button>

      {/* Content Area */}
      {isExpanded &&
      <div className="flex flex-col gap-8 bg-white rounded-[16px] p-4 sm:p-5">
          {units.map((unit, index) =>
        <div key={unit.id} className="flex flex-col gap-4">
              <h3 className="font-inter font-bold text-[18px] leading-[28px] text-[#372213]">
                {unit.title}
              </h3>
              <div className="flex flex-row flex-wrap gap-4">
                {unit.lessons.map((lesson) =>
            <LessonTile key={lesson.unitNumber} {...lesson} />
            )}
              </div>
              {/* Separator line between units (except last one) */}
              {index < units.length - 1 &&
          <div className="w-full h-px bg-gray-100 mt-4" />
          }
            </div>
        )}
        </div>
      }
    </div>);

}
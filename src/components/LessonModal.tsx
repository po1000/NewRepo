import React from 'react';
import { X, Star, Eye, EyeOff } from 'lucide-react';
interface VocabTerm {
  term: string;
  isVisible: boolean;
  proficiency?: 'learning' | 'practiced' | 'mastered';
}
interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonNumber: string;
  lessonTitle: string;
  goal: string;
  vocabTerms: VocabTerm[];
  onStartLesson?: () => void;
}
export function LessonModal({
  isOpen,
  onClose,
  lessonNumber,
  lessonTitle,
  goal,
  vocabTerms,
  onStartLesson
}: LessonModalProps) {
  if (!isOpen) return null;
  const getProficiencyIcon = (
  proficiency?: 'learning' | 'practiced' | 'mastered') =>
  {
    if (!proficiency) return null;
    const bars =
    proficiency === 'learning' ? 1 : proficiency === 'practiced' ? 2 : 3;
    return (
      <div className="flex gap-0.5 items-end">
        {[1, 2, 3].map((bar) =>
        <div
          key={bar}
          className={`w-1.5 ${bar === 1 ? 'h-2' : bar === 2 ? 'h-3' : 'h-4'} rounded-sm ${bar <= bars ? 'bg-[#FF4D01]' : 'bg-[#EBEBEB]'}`} />

        )}
      </div>);

  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}>
      
      <div
        className="relative w-full max-w-[662px] bg-[#FFF4A2] rounded-[16px] shadow-[0px_2px_10px_rgba(0,0,0,0.25)] p-5 max-h-[90vh] overflow-y-auto flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button - Moved to top left to avoid overlap */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 hover:bg-black/5 rounded-full transition-colors z-10"
          aria-label="Close modal">
          
          <X className="w-6 h-6 text-[#372213]" />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-2 mt-8">
          <div className="flex flex-row justify-between items-start">
            <div className="flex flex-col gap-1 flex-1 pr-4">
              <h2 className="font-inter font-bold text-[20.4px] leading-[32px] text-[#372213]">
                {lessonNumber} {lessonTitle}
              </h2>
              <p className="font-inter font-medium italic text-[16px] leading-[24px] text-[#372213]">
                Goal: {goal}
              </p>
            </div>
            <button className="flex flex-row items-center gap-2 px-3 py-2 border border-[#372213] rounded-lg hover:bg-black/5 transition-colors shrink-0">
              <Star className="w-4 h-4 text-[#372213]" />
              <span className="font-inter font-semibold text-[16px] leading-[28px] text-black">
                Grammar
              </span>
            </button>
          </div>
        </div>

        {/* Words & Phrases Section */}
        <div className="bg-[#FFFEF4] rounded-[16px] p-4">
          <h3 className="font-inter font-bold text-[18px] leading-[28px] text-[#372213] mb-4">
            Words & Phrases
          </h3>

          <div className="flex flex-col gap-2">
            {vocabTerms.map((item, index) =>
            <div
              key={index}
              className="flex flex-row justify-between items-center py-2">
              
                <span className="font-inter font-semibold text-[16px] leading-[28px] text-[#372213] flex-1">
                  {item.term}
                </span>
                <div className="flex items-center gap-2">
                  {item.proficiency && getProficiencyIcon(item.proficiency)}
                  {item.isVisible ?
                <Eye className="w-6 h-6 text-[#372213]" /> :

                <EyeOff className="w-6 h-6 text-gray-400" />
                }
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Start Lesson Button */}
        <button
          onClick={onStartLesson}
          className="w-full py-3 bg-[#FF4D01] hover:bg-[#e64500] transition-colors rounded-xl text-white font-inter font-bold text-[16px] leading-[24px]">
          
          Start Lesson
        </button>
      </div>
    </div>);

}
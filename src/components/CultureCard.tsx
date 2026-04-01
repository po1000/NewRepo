import React from 'react';
import { ChevronRight } from 'lucide-react';
interface CultureCardProps {
  onClick?: () => void;
}
export function CultureCard({ onClick }: CultureCardProps) {
  return (
    <div
      onClick={onClick}
      className="relative flex flex-row items-center justify-between w-full max-w-[632px] mx-auto h-[90px] rounded-[16px] overflow-hidden bg-gradient-to-b from-[#445CFB] to-[#47D7FF] px-5 cursor-pointer hover:opacity-95 transition-opacity">
      
      {/* Content */}
      <div className="flex flex-col z-10">
        <h3 className="font-inter font-bold text-[17px] leading-[28px] text-white">
          Explore Spanish Culture
        </h3>
        <p className="font-inter text-[11.9px] leading-[20px] text-white/90">
          Music, Food, History & More
        </p>
      </div>

      {/* Arrow Button */}
      <div className="z-10 flex items-center justify-center w-[35px] h-[35px] rounded-full border-2 border-white bg-[#46A8FD]">
        <ChevronRight className="w-5 h-5 text-white" aria-hidden="true" />
      </div>

      {/* Background Map Illustration (Decorative) */}
      <div className="absolute right-0 top-0 bottom-0 w-[352px] opacity-80 pointer-events-none mix-blend-overlay rounded-r-[16px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&q=80&w=352&h=90"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true" />
        
      </div>
    </div>);

}
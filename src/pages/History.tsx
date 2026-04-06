import React, { useState, useRef } from 'react';
import { ChevronRightIcon, ChevronLeftIcon, InfoIcon } from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { STORAGE_URL } from '../lib/storage';

interface TimelineItem {
  id: string;
  title: string;
  period: string;
  color: string;
  bgColor: string;
  borderColor: string;
  content: React.ReactNode;
  imageUrl: string;
  isFunFact?: boolean;
}
const TIMELINE_DATA: TimelineItem[] = [
{
  id: '1',
  title: 'Before Spain',
  period: 'Pre-Roman Era',
  color: '#1D4ED8',
  bgColor: '#EFF6FF',
  borderColor: '#93C5FD',
  imageUrl: `${STORAGE_URL}/culture/history/before%20spain.svg`,

  content:
  <div className="space-y-3 font-inter">
        <p>
          The Iberian Peninsula was home to various groups including Iberians,
          Celts, and Basques.
        </p>
        <p>
          <strong>Roman conquest (3rd century BC):</strong> Romans brought
          Vulgar Latin, which became the foundation of Spanish.
        </p>
      </div>

},
{
  id: 'fun-fact-1',
  title: 'How Spain Got Its Name',
  period: '9th Century BC',
  color: '#D97706',
  bgColor: '#FFFBEB',
  borderColor: '#FDE68A',
  isFunFact: true,
  imageUrl: '',
  content:
  <p className="font-inter">
        Phoenician traders arrived on the Iberian Peninsula around the 9th
        century BC, found the land overrun with rabbits and named it{' '}
        <strong>'I-Shaphan-im'</strong>. Romans later adapted this into{' '}
        <strong>'Hispania'</strong>, which eventually became{' '}
        <strong>'España'</strong>, meaning Spain.
      </p>

},
{
  id: '2',
  title: 'Origins of Castilian',
  period: 'Post-Roman Empire',
  color: '#059669',
  bgColor: '#ECFDF5',
  borderColor: '#6EE7B7',
  imageUrl: `${STORAGE_URL}/culture/history/orgin%20of%20castiliain.svg`,

  content:
  <p className="font-inter">
        Castellano (Castilian) began in northern Castilla, after the Roman
        Empire fell. The Latin spoken by ordinary people slowly changed in
        different parts of the Iberian Peninsula, and in Castilla it developed
        its own sounds, words, and grammar over centuries.
      </p>

},
{
  id: '3',
  title: 'Moorish Influence',
  period: '711 - 1492',
  color: '#DC2626',
  bgColor: '#FEF2F2',
  borderColor: '#FCA5A5',
  imageUrl: `${STORAGE_URL}/culture/history/arab%20influence.svg`,

  content:
  <div className="space-y-3 font-inter">
        <p>
          Muslim Moors from North Africa ruled much of Spain for nearly 800
          years. Around 4,000 Spanish words (8% of the dictionary) come from
          Arabic.
        </p>
        <p>
          The Moors shaped Spanish culture through music (guitar, flamenco),
          food (chickpeas, saffron, herbs and spices), architecture (intricate
          tiles, arches, courtyards like the Alhambra), advances in science and
          maths, and agriculture, introducing crops like lemons and rice.
        </p>
        <div className="bg-white/60 p-3 rounded-lg border border-[#FECACA] mt-2">
          <p className="font-semibold text-[#DC2626] mb-1 text-[13px] font-inter">
            Arabic-origin words:
          </p>
          <ul className="text-[13px] space-y-1 font-inter">
            <li>
              <strong>Aceite</strong> (oil), from az-zeit
            </li>
            <li>
              <strong>Azúcar</strong> (sugar), from as-sukkar
            </li>
            <li>
              <strong>Ojalá</strong> (hopefully), from insh'allah
            </li>
          </ul>
        </div>
      </div>

},
{
  id: '4',
  title: 'The Reconquista',
  period: '722 - 1492',
  color: '#7C3AED',
  bgColor: '#F5F3FF',
  borderColor: '#C4B5FD',
  imageUrl: `${STORAGE_URL}/culture/history/monarchs.svg`,

  content:
  <div className="space-y-3 font-inter">
        <p>
          A 700-year effort by Christian kingdoms to reclaim Spain from Moorish
          rule. As these kingdoms expanded southward, Castilian spread with
          them.
        </p>
        <ul className="list-disc pl-4 space-y-2">
          <li>
            El Cid helped raise the prestige of Castilian through military
            victories.
          </li>
          <li>
            In the 13th century, King Alfonso X ordered laws written in
            Castilian not Latin.
          </li>
          <li>In 1492, Antonio de Nebrija published the Castilian grammar.</li>
          <li>
            That same year, Granada fell to Catholic Monarchs Ferdinand II and
            Isabella I, unifying Spain and establishing Castilian as the
            official language.
          </li>
        </ul>
      </div>

}];

export function History() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };
  return (
    <PageLayout backgroundColor="#E2F4FF">
      {/* Blue Swoosh Background */}
      <div className="absolute top-0 left-0 right-0 h-[108px] bg-[#9EDAFF] rounded-b-[50%] -translate-y-1/2 opacity-50 pointer-events-none" />

      {/* Main Content */}
      <div className="max-w-[940px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <div className="max-w-[690px] mx-auto mt-12 mb-3">
          <div className="bg-white rounded-[12px] border border-[#DBEAFE] p-6 shadow-sm">
            <h1 className="font-inter font-bold text-[22px] leading-[32px] text-[#372213] mb-2">
              Modern Spanish culture is a blend of Roman, Arab, and Christian
              influences.
            </h1>
            <p className="font-inter text-[14px] leading-[24px] text-[#4B5563]">
              Travel through time and learn about the fascinating origins of
              Spain and the Castilian language.
            </p>
          </div>
        </div>

        {/* Drag to explore hint */}
        <div className="max-w-[690px] mx-auto mb-0 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-5 py-2 rounded-full shadow-sm text-[#4B5563] font-inter font-medium text-[13px]">
            <ChevronLeftIcon className="w-4 h-4 animate-pulse" />
            <span>Drag to explore the timeline</span>
            <ChevronRightIcon className="w-4 h-4 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Timeline Scroll Area */}
      <div className="w-full pb-20 relative">
        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className={`w-full overflow-x-auto overflow-y-hidden hide-scrollbar select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{
            scrollBehavior: isDragging ? 'auto' : 'smooth'
          }}>

          <div className="flex items-center min-w-max px-4 sm:px-[calc(50vw-345px)] pt-4 pb-8 relative">
            {/* Connecting Line (gradient) */}
            <div
              className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 z-0 rounded-full"
              style={{
                background:
                'linear-gradient(to right, #3B82F6, #10B981, #EF4444, #8B5CF6)'
              }} />


            {/* Timeline Items */}
            <div className="flex items-center gap-6 relative z-10">
              {TIMELINE_DATA.map((item, index) =>
              <div
                key={item.id}
                className="relative flex flex-col items-center">

                  {/* Timeline Node removed */}

                  {/* Card */}
                  <div
                  className={`w-[240px] sm:w-[280px] rounded-xl overflow-hidden flex flex-col shadow-lg border-2 ${item.isFunFact ? 'my-0' : index % 2 === 0 ? 'mb-[260px]' : 'mt-[260px]'}`}
                  style={{
                    backgroundColor: item.bgColor,
                    borderColor: item.borderColor
                  }}>

                    {/* Fun Fact Header */}
                    {item.isFunFact &&
                  <div
                    className="px-4 py-2 flex items-center gap-2"
                    style={{
                      backgroundColor: item.borderColor
                    }}>

                        <InfoIcon className="w-4 h-4 text-[#D97706]" />
                        <span className="font-inter font-bold text-[12px] uppercase tracking-wider text-[#D97706]">
                          Fun Fact
                        </span>
                      </div>
                  }

                    {/* Clipart Image */}
                    {!item.isFunFact && item.imageUrl &&
                  <div
                    className="w-full h-[130px] flex items-center justify-center relative"
                    style={{
                      background: `linear-gradient(135deg, ${item.bgColor}, ${item.borderColor}40)`
                    }}>

                        <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-[100px] h-[100px] object-contain drop-shadow-md"
                      draggable="false" />

                        <div
                      className="absolute bottom-2 left-3 px-2 py-0.5 rounded-full text-white font-inter font-bold text-[10px] uppercase tracking-wider"
                      style={{
                        backgroundColor: item.color
                      }}>

                          {item.period}
                        </div>
                      </div>
                  }

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3
                      className="font-inter font-bold text-[16px] leading-tight mb-2"
                      style={{
                        color: item.color
                      }}>

                        {item.title}
                      </h3>
                      <div className="font-inter text-[12.5px] leading-[20px] text-[#4B5563]">
                        {item.content}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hide scrollbar styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `
        }} />

    </PageLayout>);

}

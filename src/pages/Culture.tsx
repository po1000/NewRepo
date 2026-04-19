import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { STORAGE_URL } from '../lib/storage';
import { usePageTitle } from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';

interface CultureCategory {
  id: string;
  title: string;
  imageUrl: string;
  iconUrl: string;
  color: string;
  route: string;
}

const categories: CultureCategory[] = [
  {
    id: '1',
    title: 'Music and Dance',
    imageUrl: `${STORAGE_URL}/culture/music%20+%20icon/image%2017.png`,
    iconUrl: `${STORAGE_URL}/culture/music%20+%20icon/Frame.svg`,
    color: '#528AFF',
    route: '/culture/music-dance',
  },
  {
    id: '3',
    title: 'Food & Drink',
    imageUrl: `${STORAGE_URL}/culture/food/image%2018.png`,
    iconUrl: `${STORAGE_URL}/culture/food/Vector.svg`,
    color: '#FF5900',
    route: '/culture/food-drink',
  },
  {
    id: '4',
    title: 'Regions & Landmarks',
    imageUrl: `${STORAGE_URL}/culture/regions/image%2018-1.png`,
    iconUrl: `${STORAGE_URL}/culture/regions/Vector-1.svg`,
    color: '#1B9F00',
    route: '/culture/regions-landmarks',
  },
  {
    id: '5',
    title: 'History',
    imageUrl: `${STORAGE_URL}/culture/history/image%2018-2.png`,
    iconUrl: `${STORAGE_URL}/culture/history/Vector-2.svg`,
    color: '#EDA200',
    route: '/culture/history',
  },
];

export function Culture() {
  usePageTitle('Culture');
  const navigate = useNavigate();
  const { t, showInstructions } = useLanguage();

  return (
    <PageLayout backgroundColor="#E2F4FF">
      {/* Blue Swoosh Background */}
      <div className="absolute top-0 left-0 right-0 h-[108px] bg-[#9EDAFF] rounded-b-[50%] -translate-y-1/2 opacity-50 pointer-events-none" />

      <div className="max-w-[940px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 mt-8 mb-12">
          <h1 className="font-inter font-bold text-[25.5px] leading-[36px] text-[#372213] text-center">
            {t('page.culture')}
          </h1>
          <p className="font-inter text-[13.6px] leading-[24px] text-[#372213] text-center">
            {t('page.cultureSubtitle')}
          </p>
        </div>
        {showInstructions && (
          <div className="max-w-[605px] mx-auto bg-white/80 rounded-[12px] px-4 py-3 shadow-sm border border-[#0088E9]/20 mb-6">
            <p className="font-inter text-[13px] leading-[20px] text-[#372213]">
              {t('instructions.culture')}
            </p>
          </div>
        )}

        {/* Culture Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[605px] mx-auto pb-20">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => navigate(category.route)}
              className="relative w-full h-[158px] rounded-xl border border-[#E5E7EB] bg-white overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            >
              <img
                src={category.imageUrl}
                alt={category.title}
                className="absolute inset-0 w-full h-full object-cover rounded-xl"
              />
              <div
                className="absolute top-[25px] left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: category.color }}
              >
                <img src={category.iconUrl} alt="" className="w-8 h-8" aria-hidden="true" />
              </div>
              <div
                className="absolute bottom-[25px] left-1/2 -translate-x-1/2 px-4 py-1 rounded-lg shadow-[0px_4px_4px_rgba(0,0,0,0.25)] whitespace-nowrap"
                style={{ backgroundColor: category.color }}
              >
                <span className="font-inter font-bold text-[15.3px] leading-[28px] text-white">
                  {category.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Games Section */}
        <div className="max-w-[605px] mx-auto mt-6 pb-20">
          <h2 className="font-inter font-bold text-[20px] text-[#372213] mb-4">{t('culture.games')}</h2>
          <div
            onClick={() => navigate('/culture/games/piano-tiles')}
            className="relative w-full h-[120px] rounded-xl bg-gradient-to-r from-[#1a1a2e] to-[#2d2d5e] overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-white/10"
          >
            <div className="absolute inset-0 flex items-center px-6 gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-[#FF4D01] to-[#FF8C00] rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <Gamepad2 className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[17px] text-white mb-0.5">Word Tiles</p>
                <p className="text-[12px] text-white/60 leading-[18px]">
                  Piano tiles meets vocabulary! Tap the correct translation as tiles scroll down to play songs like Despacito.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

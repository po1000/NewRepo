import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { STORAGE_URL } from '../lib/storage';

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
  const navigate = useNavigate();

  return (
    <PageLayout backgroundColor="#E2F4FF">
      {/* Blue Swoosh Background */}
      <div className="absolute top-0 left-0 right-0 h-[108px] bg-[#9EDAFF] rounded-b-[50%] -translate-y-1/2 opacity-50 pointer-events-none" />

      <div className="max-w-[940px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 mt-8 mb-12">
          <h1 className="font-inter font-bold text-[25.5px] leading-[36px] text-[#372213] text-center">
            Culture Area
          </h1>
          <p className="font-inter text-[13.6px] leading-[24px] text-[#4B5563] text-center">
            Discover the richness of Spanish traditions
          </p>
        </div>

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
      </div>
    </PageLayout>
  );
}

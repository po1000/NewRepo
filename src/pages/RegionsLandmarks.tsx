import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { STORAGE_URL } from '../lib/storage';
import { usePageTitle } from '../hooks/usePageTitle';

interface RegionsLandmarksProps {
  initialRegion?: ViewType | null;
}
type ViewType =
'madrid' |
'barcelona' |
'andalucia' |
'palacio-real' |
'sagrada-familia';
interface ClickableItem {
  id: ViewType;
  name: string;
  left: string;
  top: string;
  width: string;
  height: string;
  circleImage: string;
}
const CLICKABLE_ITEMS: ClickableItem[] = [
{
  id: 'sagrada-familia',
  name: 'Sagrada Familia',
  left: '83.5%',
  top: '16.8%',
  width: '15.6%',
  height: '11.9%',
  circleImage: `${STORAGE_URL}/culture/regions/sagrada%20circle.svg`
},
{
  id: 'palacio-real',
  name: 'Palacio Real',
  left: '40.7%',
  top: '32.2%',
  width: '12.4%',
  height: '9.4%',
  circleImage: `${STORAGE_URL}/culture/regions/palacio%20real%20%20circle.svg`
},
{
  id: 'madrid',
  name: 'Madrid',
  left: '38.8%',
  top: '37%',
  width: '10.7%',
  height: '8.1%',
  circleImage: `${STORAGE_URL}/culture/regions/madrid%20cricle.svg`
},
{
  id: 'andalucia',
  name: 'Andalucia',
  left: '31.6%',
  top: '66.4%',
  width: '21.5%',
  height: '16.3%',
  circleImage: `${STORAGE_URL}/culture/regions/andalucia%20circle.svg`
},
{
  id: 'barcelona',
  name: 'Barcelona',
  left: '77.1%',
  top: '24.9%',
  width: '14.3%',
  height: '10.8%',
  circleImage: `${STORAGE_URL}/culture/regions/barcelona%20circle.svg`
}];

interface DetailData {
  id: ViewType;
  name: string;
  type: 'region' | 'landmark';
  videoUrl?: string;
  streetViewUrl?: string;
  descriptionEn: string;
  descriptionEs: string;
}
const DETAIL_DATA: Record<ViewType, DetailData> = {
  madrid: {
    id: 'madrid',
    name: 'Madrid',
    type: 'region',
    videoUrl: 'https://www.youtube.com/embed/e6gRU8RSqnc?autoplay=0',
    descriptionEn:
    'The capital of Spain, home to the Royal Palace, Prado Museum, and vibrant nightlife. A cultural hub blending historic architecture with modern energy.',
    descriptionEs:
    'La capital de España, hogar del Palacio Real, el Museo del Prado y una vibrante vida nocturna. Un centro cultural que combina arquitectura histórica con energía moderna.'
  },
  barcelona: {
    id: 'barcelona',
    name: 'Barcelona',
    type: 'region',
    videoUrl: 'https://www.youtube.com/embed/5y5uPLNIMzA?autoplay=0',
    descriptionEn:
    "Capital of Cataluña on the Mediterranean coast. Known for Gaudí's architecture, Las Ramblas, and a thriving arts and food scene.",
    descriptionEs:
    'Capital de Cataluña en la costa mediterránea. Conocida por la arquitectura de Gaudí, Las Ramblas y una próspera escena artística y gastronómica.'
  },
  andalucia: {
    id: 'andalucia',
    name: 'Andalucía',
    type: 'region',
    videoUrl: 'https://www.youtube.com/embed/r_eoGw40O-g?autoplay=0',
    descriptionEn:
    'Southern Spain where flamenco began. Ruled by Moors for 800 years. Includes Sevilla, Granada, Málaga, and sunny beaches.',
    descriptionEs:
    'El sur de España donde nació el flamenco. Gobernada por los moros durante 800 años. Incluye Sevilla, Granada, Málaga y playas soleadas.'
  },
  'palacio-real': {
    id: 'palacio-real',
    name: 'Palacio Real',
    type: 'landmark',
    streetViewUrl:
    'https://maps.google.com/maps?q=Palacio+Real+Madrid&layer=c&cbll=40.418,-3.714&cbp=11,0,0,0,0&output=svembed&z=17',
    descriptionEn:
    'The official residence of the Spanish royal family in Madrid. One of the largest palaces in Western Europe with over 3,000 rooms.',
    descriptionEs:
    'La residencia oficial de la familia real española en Madrid. Uno de los palacios más grandes de Europa occidental con más de 3.000 habitaciones.'
  },
  'sagrada-familia': {
    id: 'sagrada-familia',
    name: 'Sagrada Familia',
    type: 'landmark',
    streetViewUrl:
    'https://maps.google.com/maps?q=Sagrada+Familia+Barcelona&layer=c&cbll=41.4036,2.1744&cbp=11,0,0,0,0&output=svembed&z=17',
    descriptionEn:
    "Antoni Gaudí's unfinished basilica in Barcelona, under construction since 1882. A UNESCO World Heritage Site and icon of Catalan Modernism.",
    descriptionEs:
    'La basílica inacabada de Antoni Gaudí en Barcelona, en construcción desde 1882. Patrimonio de la Humanidad de la UNESCO e icono del Modernismo catalán.'
  }
};
export function RegionsLandmarks({
  initialRegion = null
}: RegionsLandmarksProps) {
  usePageTitle('Regions & Landmarks');
  const [activeView, setActiveView] = useState<ViewType | null>(initialRegion);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isSpanish, setIsSpanish] = useState(false);
  const [showStreetView, setShowStreetView] = useState(false);
  const handleClose = () => {
    setActiveView(null);
    setIsSpanish(false);
    setShowStreetView(false);
  };
  const activeData = activeView ? DETAIL_DATA[activeView] : null;
  return (
    <PageLayout backgroundColor="#E2F4FF">
      {/* Blue Swoosh Background */}
      <div className="absolute top-0 left-0 right-0 h-[108px] bg-[#9EDAFF] rounded-b-[50%] -translate-y-1/2 opacity-50 pointer-events-none" />

      {/* Main Content */}
      <div className="max-w-[940px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-[690px] mx-auto mt-12 pb-20">
          {/* Header Section */}
          <div className="bg-white rounded-t-[12px] border border-[#DBEAFE] p-6">
            <h1 className="font-inter font-bold text-[20.4px] leading-[32px] text-[#372213] mb-2">
              Regions & Landmarks
            </h1>
            <p className="font-inter text-[13.6px] leading-[24px] text-[#372213]">
              Spain is a country of diverse regions, each with its own unique
              culture, cuisine, and landmarks. Explore the map to discover the
              beauty and history of each area.
            </p>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-b-[12px] border border-t-0 border-[#E5E7EB] overflow-hidden flex flex-col">
            {/* Map Area (Always rendered) */}
            <div
              className="relative w-full overflow-hidden"
              style={{
                aspectRatio: '2482 / 1940'
              }}
              onClick={() => {
                if (!showStreetView) handleClose();
              }}>

              <img
                src={`${STORAGE_URL}/culture/regions/566-128566-128.png`}
                alt="Illustrated map of Spain showing regions, cities, and landmarks"
                className="absolute inset-0 w-full h-full object-cover" />


              {/* Interactive clickable areas with hand-drawn circle hover effect */}
              {CLICKABLE_ITEMS.map((item) =>
              <motion.button
                key={item.id}
                className="absolute cursor-pointer z-10"
                style={{
                  left: item.left,
                  top: item.top,
                  width: item.width,
                  height: item.height
                }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveView(item.id);
                  setShowStreetView(false);
                }}
                aria-label={item.name}>

                  {/* Hand-drawn circle image indicator */}
                  <AnimatePresence>
                    {(hoveredItem === item.id || activeView === item.id) &&
                  <motion.img
                    src={item.circleImage}
                    alt=""
                    initial={{
                      opacity: 0,
                      scale: 0.8
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.8
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 25
                    }}
                    className="absolute inset-[-15%] w-[130%] h-[130%] object-contain pointer-events-none" />

                  }
                  </AnimatePresence>
                </motion.button>
              )}

              {/* Small Overlay ON TOP of the map */}
              <AnimatePresence>
                {activeView && !showStreetView && activeData &&
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    y: 10
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    y: 10
                  }}
                  transition={{
                    type: 'spring',
                    damping: 25,
                    stiffness: 400
                  }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">

                    <div
                    className="relative w-[82%] max-w-[480px] bg-white rounded-xl shadow-2xl pointer-events-auto overflow-hidden border border-gray-200"
                    onClick={(e) => e.stopPropagation()}>

                      <button
                      onClick={handleClose}
                      className="absolute top-2 right-2 z-30 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                      aria-label="Close">

                        <X className="w-5 h-5 text-[#372213]" />
                      </button>

                      {activeData.type === 'region' ?
                    <div className="w-full aspect-video bg-[#111827]">
                          <iframe
                        src={activeData.videoUrl}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`${activeData.name} video`} />

                        </div> :

                    <div className="w-full aspect-video bg-[#111827] flex flex-col items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                          <p className="absolute top-4 left-0 right-0 text-center font-inter font-bold text-[15px] text-white tracking-wide">
                            {activeData.name}
                          </p>
                          <button
                        onClick={() => setShowStreetView(true)}
                        className="relative z-10 bg-[#DBEAFE] hover:bg-[#BFDBFE] transition-colors rounded-lg px-6 py-2.5 font-inter font-medium text-[13.6px] text-[#1D4ED8] shadow-lg flex items-center gap-2">

                            Enter Street View
                          </button>
                        </div>
                    }
                    </div>
                  </motion.div>
                }
              </AnimatePresence>

              {/* Full Map Takeover for Street View */}
              <AnimatePresence>
                {showStreetView && activeData?.type === 'landmark' &&
                <motion.div
                  initial={{
                    opacity: 0
                  }}
                  animate={{
                    opacity: 1
                  }}
                  exit={{
                    opacity: 0
                  }}
                  className="absolute inset-0 z-30 bg-[#111827]">

                    <button
                    onClick={() => setShowStreetView(false)}
                    className="absolute top-4 left-4 z-40 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                    aria-label="Close Street View">

                      <X className="w-6 h-6 text-[#372213]" />
                    </button>
                    <iframe
                    src={activeData.streetViewUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title={`${activeData.name} street view`} />

                  </motion.div>
                }
              </AnimatePresence>
            </div>

            {/* Description Area below map */}
            <AnimatePresence>
              {activeView && activeData &&
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0
                }}
                animate={{
                  opacity: 1,
                  height: 'auto'
                }}
                exit={{
                  opacity: 0,
                  height: 0
                }}
                className="border-t border-[#E5E7EB] bg-white overflow-hidden">

                  <div className="p-6">
                    <h2 className="font-inter font-bold text-[17px] leading-[28px] text-[#372213] mb-4">
                      {activeData.name}
                    </h2>
                    <p className="font-inter text-[13.6px] leading-[26px] text-[#372213] mb-6 max-w-[520px]">
                      {isSpanish ?
                    activeData.descriptionEs :
                    activeData.descriptionEn}
                    </p>
                    <button
                    onClick={() => setIsSpanish(!isSpanish)}
                    className="bg-[#DBEAFE] hover:bg-[#BFDBFE] transition-colors rounded-lg px-4 py-2 font-inter font-medium text-[11.9px] leading-[20px] text-[#1D4ED8]">

                      {isSpanish ?
                    'Translate to English' :
                    'Translate to Spanish'}
                    </button>
                  </div>
                </motion.div>
              }
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageLayout>);

}

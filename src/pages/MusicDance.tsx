import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { usePageTitle } from '../hooks/usePageTitle';

interface DanceEntry {
  title: string;
  number: number;
  videoUrl: string;
  descriptionEn: React.ReactNode;
  descriptionEs: React.ReactNode;
}
const DANCE_ENTRIES: DanceEntry[] = [
{
  title: 'Flamenco',
  number: 1,
  videoUrl: 'https://www.youtube.com/embed/fv9RtLZ5NsA?start=627',
  descriptionEn:
  <p className="font-inter text-[13.6px] leading-[26px] text-[#4B5563] mb-6">
        A style of passionate traditional <strong>singing</strong>, playing
        guitar and dance originating in Andalusia. Performances feature{' '}
        <strong>el/la cantaor/a (singer)</strong>,{' '}
        <strong>el/la tocaor/a (guitarist)</strong>, and{' '}
        <strong>el/la bailaor/a (dancer)</strong>, who performs{' '}
        <strong>el zapateado (rhythmic footwork)</strong> while the supporters
        join in with <strong>las palmas (hand clapping)</strong> and{' '}
        <strong>el jaleo (shouts of encouragement)</strong>.
      </p>,

  descriptionEs:
  <p className="font-inter text-[13.6px] leading-[26px] text-[#4B5563] mb-6">
        Un estilo de <strong>canto</strong> tradicional apasionado, toque de
        guitarra y baile originario de Andalucía. Las actuaciones cuentan con{' '}
        <strong>el/la cantaor/a</strong>,{' '}
        <strong>el/la tocaor/a (guitarrista)</strong> y{' '}
        <strong>el/la bailaor/a</strong>, que ejecuta{' '}
        <strong>el zapateado (trabajo rítmico de pies)</strong> mientras los
        seguidores acompañan con <strong>las palmas</strong> y{' '}
        <strong>el jaleo (gritos de ánimo)</strong>.
      </p>

},
{
  title: 'El Pasodoble',
  number: 2,
  videoUrl: 'https://www.youtube.com/embed/CxZx2r9bfJw',
  descriptionEn:
  <p className="font-inter text-[13.6px] leading-[26px] text-[#4B5563] mb-6">
        Means <strong>'two-step'</strong>. A dramatic Spanish dance originating
        in Spain that mimics a bullfight. The male dancer represents{' '}
        <strong>el torero (bullfighter)</strong> while{' '}
        <strong>la pareja (partner)</strong> represents{' '}
        <strong>el capote (cape)</strong>. Each <strong>el paso (step)</strong>{' '}
        is bold and theatrical.
      </p>,

  descriptionEs:
  <p className="font-inter text-[13.6px] leading-[26px] text-[#4B5563] mb-6">
        Significa <strong>'dos pasos'</strong>. Un baile español dramático
        originario de España que imita una corrida de toros. El bailarín
        masculino representa a <strong>el torero</strong> mientras que{' '}
        <strong>la pareja</strong> representa <strong>el capote</strong>. Cada{' '}
        <strong>el paso</strong> es audaz y teatral.
      </p>

},
{
  title: 'El Reggaetón',
  number: 3,
  videoUrl: 'https://www.youtube.com/embed/kJQP7kiw5Fk',
  descriptionEn:
  <p className="font-inter text-[13.6px] leading-[26px] text-[#4B5563] mb-6">
        Latin music derived from Jamaican dancehall music but born in{' '}
        <strong>Panamá</strong>, known for its distinctive{' '}
        <strong>el dembow (dembow beat)</strong>. Top artists include:{' '}
        <strong>Bad Bunny</strong>, <strong>Karol G</strong> &{' '}
        <strong>J Balvin</strong>.
      </p>,

  descriptionEs:
  <p className="font-inter text-[13.6px] leading-[26px] text-[#4B5563] mb-6">
        Música latina derivada del dancehall jamaicano pero nacida en{' '}
        <strong>Panamá</strong>, conocida por su distintivo{' '}
        <strong>el dembow (ritmo dembow)</strong>. Los artistas más destacados
        incluyen: <strong>Bad Bunny</strong>, <strong>Karol G</strong> y{' '}
        <strong>J Balvin</strong>.
      </p>

}];

export function MusicDance() {
  usePageTitle('Music & Dance');
  const [currentPage, setCurrentPage] = useState(0);
  const [isSpanish, setIsSpanish] = useState(false);
  const [direction, setDirection] = useState(1);
  const entry = DANCE_ENTRIES[currentPage];
  const isFirst = currentPage === 0;
  const isLast = currentPage === DANCE_ENTRIES.length - 1;
  const goNext = () => {
    if (!isLast) {
      setDirection(1);
      setCurrentPage((p) => p + 1);
      setIsSpanish(false);
    }
  };
  const goPrev = () => {
    if (!isFirst) {
      setDirection(-1);
      setCurrentPage((p) => p - 1);
      setIsSpanish(false);
    }
  };
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0
    })
  };
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
              Music & Dance
            </h1>
            <p className="font-inter text-[13.6px] leading-[24px] text-[#372213]">
              Music and dance are at the heart of Spanish culture — from the
              passionate rhythms of flamenco to the vibrant beats of reggaeton.
              Watch, read, and immerse yourself in the sounds of Spain.
            </p>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-b-[12px] border border-t-0 border-[#E5E7EB] overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentPage}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  duration: 0.3,
                  ease: 'easeInOut'
                }}>

                {/* Video Container */}
                <div className="w-full aspect-video bg-[#111827]">
                  <iframe
                    src={entry.videoUrl}
                    title={entry.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0" />

                </div>

                {/* Description Section */}
                <div className="p-6 relative min-h-[220px]">
                  <h2 className="font-inter font-bold text-[17px] leading-[28px] text-[#372213] mb-4">
                    {entry.number}. {entry.title}
                  </h2>

                  <div className="max-w-[520px]">
                    {isSpanish ? entry.descriptionEs : entry.descriptionEn}

                    <button
                      onClick={() => setIsSpanish(!isSpanish)}
                      className="bg-[#DBEAFE] hover:bg-[#BFDBFE] transition-colors rounded-lg px-4 py-2 font-inter font-medium text-[11.9px] leading-[20px] text-[#1D4ED8]">

                      {isSpanish ?
                      'Translate to English' :
                      'Translate to Spanish'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 pb-5 pt-1">
              <button
                onClick={goPrev}
                disabled={isFirst}
                className={`flex items-center gap-1.5 font-inter font-medium text-[13px] transition-colors rounded-lg px-3 py-2 ${isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-[#1D4ED8] hover:bg-[#DBEAFE]'}`}>

                <ChevronLeftIcon className="w-4 h-4" />
                Previous
              </button>

              {/* Page dots */}
              <div className="flex items-center gap-2">
                {DANCE_ENTRIES.map((_, i) =>
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentPage ? 1 : -1);
                    setCurrentPage(i);
                    setIsSpanish(false);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${i === currentPage ? 'bg-[#1D4ED8] w-5' : 'bg-gray-300 hover:bg-gray-400'}`}
                  aria-label={`Go to ${DANCE_ENTRIES[i].title}`} />

                )}
              </div>

              <button
                onClick={goNext}
                disabled={isLast}
                className={`flex items-center gap-1.5 font-inter font-medium text-[13px] transition-colors rounded-lg px-3 py-2 ${isLast ? 'text-gray-300 cursor-not-allowed' : 'text-[#1D4ED8] hover:bg-[#DBEAFE]'}`}>

                Next
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>);

}

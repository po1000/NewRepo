import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, PlayCircle } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { UserProfile } from '../components/UserProfile';
import { STORAGE_URL } from '../lib/storage';
interface FoodDrinkProps {
  onNavigateBack?: () => void;
  onLearnSpeakWriteClick?: () => void;
  onCultureClick?: () => void;
  onGrammarClick?: () => void;
  onCommunityClick?: () => void;
  onNavigateToRegion?: (region: string) => void;
}
interface MenuItem {
  id: string;
  name: string;
  description: string;
  origin?: string;
  originRegion?: string;
  imageUrl: string;
  videoUrl?: string;
  ingredients?: string[];
}
interface MenuSection {
  title: string;
  items: MenuItem[];
}
const MENU_DATA: MenuSection[] = [
{
  title: 'TAPAS',
  items: [
  {
    id: 'tortilla',
    name: 'TORTILLA ESPAÑOLA',
    description:
    'Thick omelette made with eggs, sliced potatoes, and onions. Served warm in slices. Popular nationwide.',
    imageUrl: `${STORAGE_URL}/culture/food/__opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__recipes__images__2016__06__20160603-tortilla-espanola-vicky-wasik-16-08693f341420437d9ed0229f2bcfa251.jpg`,

    videoUrl: 'https://www.youtube.com/embed/5mKyaTcf9FA',
    ingredients: [
    '1/2 cup extra virgin olive oil (125 ml)',
    '3 medium sized potatoes',
    '1 large onion',
    '6 large cage-free organic eggs',
    'sea salt']

  },
  {
    id: 'bravas',
    name: 'PATATAS BRAVAS',
    description:
    'Crispy fried potato chunks topped with spicy tomato-paprika sauce, often with garlic aioli.',
    origin: 'Madrid',
    originRegion: 'madrid',
    imageUrl: `${STORAGE_URL}/culture/food/patatas-bravas.jpg`

  },
  {
    id: 'gambas',
    name: 'GAMBAS AL AJILLO',
    description:
    'Shrimp sautéed in olive oil with sliced garlic, chili, and parsley. Served sizzling hot.',
    origin: 'Andalusia',
    originRegion: 'andalucia',
    imageUrl: `${STORAGE_URL}/culture/food/GambasPilPil-0a9531b.jpg`

  }]

},
{
  title: 'MAIN MENU',
  items: [
  {
    id: 'paella',
    name: 'PAELLA',
    description:
    'Saffron rice with chicken, rabbit, green beans, and vegetables cooked in a wide pan.',
    origin: 'Valencia',
    imageUrl: `${STORAGE_URL}/culture/food/Paella-7.jpg`,

    videoUrl: 'https://www.youtube.com/embed/08W7LZDtnEI',
    ingredients: [
    '600g Valencian arroz redondo',
    '1.8kg stock or water',
    '1.2kg chicken thighs',
    '5 artichokes (quartered)',
    '0.7g saffron',
    '300g green beans',
    '230g grated tomato',
    '2 tsp choricero pepper paste',
    '1 tsp smoked paprika',
    'Fresh rosemary',
    'Salt to taste']

  },
  {
    id: 'fabada',
    name: 'FABADA',
    description:
    'Hearty white bean stew with chorizo, morcilla blood sausage, and bacon. Slow-cooked.',
    origin: 'Asturias',
    imageUrl: `${STORAGE_URL}/culture/food/fabada-spanish-bean-stew-with-chorizo-and-blood-sausage-XL-RECIPE0917-3055f2562ce042dd80ab7531fe89698b.jpg`

  }]

},
{
  title: 'DRINKS',
  items: [
  {
    id: 'sangria',
    name: 'SANGRÍA',
    description:
    'Red wine punch mixed with chopped fruit, brandy, and orange juice. Served chilled.',
    origin: 'Andalucía',
    originRegion: 'andalucia',
    imageUrl: `${STORAGE_URL}/culture/food/istockphoto-500005177-612x612.jpg`

  },
  {
    id: 'horchata',
    name: 'HORCHATA',
    description:
    'Sweet creamy drink made from tiger nuts, water, and sugar. Served cold.',
    origin: 'Valencia',
    imageUrl: `${STORAGE_URL}/culture/food/Horchata-2-of-3-1-683x1024.jpg`,

    videoUrl: 'https://www.youtube.com/embed/sL5ccEwLXaU',
    ingredients: [
    '1.5 cup long grain white rice',
    '1 large cinnamon stick',
    '4 cups boiling water',
    '1 can sweetened condensed milk',
    '1 can evaporated milk',
    '4 cups milk',
    '2 cups water (optional)',
    '1 tbsp Mexican vanilla blend',
    'Lots of ice']

  }]

},
{
  title: 'DESSERTS',
  items: [
  {
    id: 'churros',
    name: 'CHURROS CON CHOCOLATE',
    description:
    'Crispy fried dough sticks dusted with sugar, served with thick hot chocolate for dipping.',
    origin: 'Madrid',
    originRegion: 'madrid',
    imageUrl:
    'https://images.unsplash.com/photo-1624371414361-e670edf4898d?auto=format&fit=crop&q=80&w=400&h=300'
  },
  {
    id: 'tarta',
    name: 'TARTA DE SANTIAGO',
    description:
    'Moist almond cake with eggs, sugar, and lemon zest. Marked with powdered sugar cross.',
    origin: 'Galicia',
    imageUrl: `${STORAGE_URL}/culture/food/2025D048_REGIONAL_CLASSIC_TORTA_DE_SANTIAGO_1-768x960.jpg`,

    videoUrl: 'https://www.youtube.com/embed/JesYuzdlu_s',
    ingredients: [
    '2.5 cups raw blanched almonds (350g)',
    '1.25 cups granulated sugar (250g)',
    '5 large eggs',
    '1 tsp cinnamon powder',
    '1 tsp lemon zest',
    '2 tbsp powdered sugar',
    'Nonstick cooking spray']

  }]

}];

export function FoodDrink({
  onNavigateBack,
  onLearnSpeakWriteClick,
  onCultureClick,
  onGrammarClick,
  onCommunityClick,
  onNavigateToRegion
}: FoodDrinkProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [expandedIngredients, setExpandedIngredients] = useState<
    Record<string, boolean>>(
    {});
  const toggleItem = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  const toggleIngredients = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIngredients((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  const handleRegionClick = (region: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigateToRegion) {
      onNavigateToRegion(region);
    }
  };
  return (
    <div className="min-h-screen w-full bg-[#E2F4FF] font-inter">
      {/* Blue Swoosh Background */}
      <div className="absolute top-0 left-0 right-0 h-[108px] bg-[#9EDAFF] rounded-b-[50%] -translate-y-1/2 opacity-50 pointer-events-none" />

      {/* Top Navigation */}
      <div className="max-w-[940px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="relative flex flex-col pt-[42px]">
          <div className="absolute right-4 top-[42px] z-20 hidden md:block">
            <UserProfile username="username_here" />
          </div>
          <Navigation
            onLearnLessonsClick={onNavigateBack}
            onLearnSpeakWriteClick={onLearnSpeakWriteClick}
            onCultureClick={onCultureClick}
            onGrammarClick={onGrammarClick}
            onCommunityClick={onCommunityClick} />
          
          <div className="flex justify-end mt-4 md:hidden">
            <UserProfile username="username_here" />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[690px] mx-auto mt-12 pb-20">
          {/* Header Section */}
          <div className="bg-white rounded-t-[12px] border border-[#DBEAFE] p-6">
            <h1 className="font-inter font-bold text-[20.4px] leading-[32px] text-[#372213] mb-2">
              Food & Drink
            </h1>
            <p className="font-inter text-[13.6px] leading-[24px] text-[#372213]">
              Spanish cuisine is a vibrant mix of fresh ingredients, regional
              specialties, and centuries of tradition. Explore our menu to
              discover the flavors of Spain.
            </p>
          </div>

          {/* Menu Section */}
          <div className="bg-[#FFFDF8] rounded-b-[12px] border border-t-0 border-[#E5E7EB] overflow-hidden p-6 sm:p-8">
            {MENU_DATA.map((section, sIndex) =>
            <div
              key={section.title}
              className={sIndex > 0 ? 'mt-12' : 'mt-2'}>
              
                {/* Section Header */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="h-[1px] flex-1 bg-[#D1D5DB]" />
                  <h2 className="font-serif font-bold text-[22px] tracking-widest text-[#92400E]">
                    {section.title}
                  </h2>
                  <div className="h-[1px] flex-1 bg-[#D1D5DB]" />
                </div>

                {/* Section Items */}
                <div className="flex flex-col gap-6">
                  {section.items.map((item) =>
                <div
                  key={item.id}
                  className={`flex flex-col rounded-xl border transition-all duration-300 ${item.videoUrl ? 'border-[#FCD34D] bg-white shadow-sm hover:shadow-md cursor-pointer' : 'border-transparent'}`}
                  onClick={() => item.videoUrl && toggleItem(item.id)}>
                  
                      <div className="flex gap-4 p-4">
                        {/* Food Image */}
                        <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] shrink-0 rounded-lg overflow-hidden relative">
                          <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover" />
                      
                          {item.videoUrl &&
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <PlayCircle className="w-8 h-8 text-white opacity-90 drop-shadow-md" />
                            </div>
                      }
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-serif font-bold text-[16px] sm:text-[18px] text-[#372213] leading-tight">
                              {item.name}
                            </h3>
                            {item.videoUrl &&
                        <div className="shrink-0 text-[#D97706]">
                                {expandedItems[item.id] ?
                          <ChevronUp className="w-5 h-5" /> :

                          <ChevronDown className="w-5 h-5" />
                          }
                              </div>
                        }
                          </div>
                          <p className="font-inter text-[13px] sm:text-[14px] leading-[20px] text-[#4B5563] mt-1.5">
                            {item.description}
                          </p>
                          {item.origin &&
                      <p className="font-inter text-[12px] text-[#9CA3AF] mt-1 italic">
                              From{' '}
                              {item.originRegion ?
                        <button
                          onClick={(e) =>
                          handleRegionClick(item.originRegion!, e)
                          }
                          className="text-[#1D4ED8] hover:text-[#1E40AF] underline decoration-dotted underline-offset-2 font-medium not-italic transition-colors">
                          
                                  {item.origin}
                                </button> :

                        <span>{item.origin}</span>
                        }
                            </p>
                      }
                        </div>
                      </div>

                      {/* Expandable Video & Recipe Section */}
                      <AnimatePresence>
                        {item.videoUrl && expandedItems[item.id] &&
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0
                      }}
                      animate={{
                        height: 'auto',
                        opacity: 1
                      }}
                      exit={{
                        height: 0,
                        opacity: 0
                      }}
                      className="overflow-hidden border-t border-[#FEF3C7]">
                      
                            <div className="p-4 bg-[#FFFBEB] rounded-b-xl">
                              {/* Video Embed */}
                              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
                                <iframe
                            src={item.videoUrl}
                            title={`${item.name} Recipe Video`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0" />
                          
                              </div>

                              {/* Ingredients Toggle */}
                              {item.ingredients &&
                        <div className="bg-white rounded-lg border border-[#FDE68A] overflow-hidden">
                                  <button
                            onClick={(e) =>
                            toggleIngredients(item.id, e)
                            }
                            className="w-full flex items-center justify-between p-3 text-left hover:bg-[#FEF3C7] transition-colors">
                            
                                    <span className="font-inter font-semibold text-[14px] text-[#92400E]">
                                      View Ingredients
                                    </span>
                                    {expandedIngredients[item.id] ?
                            <ChevronUp className="w-4 h-4 text-[#92400E]" /> :

                            <ChevronDown className="w-4 h-4 text-[#92400E]" />
                            }
                                  </button>

                                  <AnimatePresence>
                                    {expandedIngredients[item.id] &&
                            <motion.div
                              initial={{
                                height: 0
                              }}
                              animate={{
                                height: 'auto'
                              }}
                              exit={{
                                height: 0
                              }}
                              className="overflow-hidden">
                              
                                        <ul className="p-4 pt-0 space-y-2">
                                          {item.ingredients.map((ing, i) =>
                                <li
                                  key={i}
                                  className="font-inter text-[13px] text-[#4B5563] flex items-start gap-2">
                                  
                                              <span className="text-[#D97706] mt-0.5">
                                                •
                                              </span>
                                              <span>{ing}</span>
                                            </li>
                                )}
                                        </ul>
                                      </motion.div>
                            }
                                  </AnimatePresence>
                                </div>
                        }
                            </div>
                          </motion.div>
                    }
                      </AnimatePresence>
                    </div>
                )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>);

}
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { UserProfile } from '../components/UserProfile';
import { Navigation } from '../components/Navigation';
import { STORAGE_URL } from '../lib/storage';
interface PracticeScenario {
  id: string;
  level: string;
  title: string;
  description: string;
  imageUrl: string;
  color: string;
}
const scenarios: PracticeScenario[] = [
{
  id: '1',
  level: 'Beginner',
  title: 'Ordering at a Café',
  description: 'Order food and drinks from a Madrid café',
  imageUrl: `${STORAGE_URL}/roleplay/image%2024-2.png`,
  color: '#FFA600'
},
{
  id: '2',
  level: 'Beginner',
  title: 'Presentation Time',
  description: 'Introduce yourself then informally present your interests.',
  imageUrl: `${STORAGE_URL}/roleplay/image%2024-3.png`,
  color: '#39AFE6'
},
{
  id: '3',
  level: 'Beginner',
  title: 'Asking for Directions',
  description: 'Navigate Madrid by asking locals for help',
  imageUrl: `${STORAGE_URL}/roleplay/image%2024.png`,
  color: '#0135D4'
},
{
  id: '4',
  level: 'Beginner',
  title: 'Shopping at a Market',
  description: 'Buy fresh produce and practice bargaining in Spanish.',
  imageUrl: `${STORAGE_URL}/roleplay/image%2024-1.png`,
  color: '#27A700'
}];

interface SpeakAndWriteProps {
  onNavigateBack?: () => void;
  onScenarioClick?: (scenarioTitle: string) => void;
  onCultureClick?: () => void;
  onGrammarClick?: () => void;
  onCommunityClick?: () => void;
}
export function SpeakAndWrite({
  onNavigateBack,
  onScenarioClick,
  onCultureClick,
  onGrammarClick,
  onCommunityClick
}: SpeakAndWriteProps) {
  return (
    <div
      className="min-h-screen w-full font-inter"
      style={{
        background:
        'radial-gradient(circle at top right, #FF1500 0%, #FFD905 100%)'
      }}>
      
      {/* Decorative Swoosh */}
      <div className="absolute top-0 left-0 right-0 h-[108px] bg-[#FF1500] rounded-b-[50%] -translate-y-1/2 opacity-50 pointer-events-none" />

      {/* Top Navigation */}
      <div className="max-w-[940px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="relative flex flex-col pt-[42px]">
          <div className="absolute right-4 top-[42px] z-20 hidden md:block">
            <UserProfile username="username_here" />
          </div>
          <div className="[&_a]:text-[#FFFDE6] [&_button]:text-[#FFFDE6] [&_svg]:text-[#FFFDE6]">
            <Navigation
              onLearnLessonsClick={onNavigateBack}
              onLearnSpeakWriteClick={() => {}}
              onCultureClick={onCultureClick}
              onGrammarClick={onGrammarClick}
              onCommunityClick={onCommunityClick} />
            
          </div>
          <div className="flex justify-end mt-4 md:hidden">
            <UserProfile username="username_here" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[684px] mx-auto px-8 pt-8 pb-20">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-6 text-center">
          <h1 className="font-inter font-bold text-[25.5px] leading-[36px] text-[#FFFDE6]">
            Practice Speaking and Writing
          </h1>
          <p className="font-inter text-[13.6px] leading-[24px] text-[#FFFDE6]">
            Practise real-world conversations with interactive scenarios.
          </p>
        </div>

        {/* Scenario Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scenarios.map((scenario) =>
          <div
            key={scenario.id}
            className="bg-white rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onScenarioClick?.(scenario.title)}>
            
              {/* Image Section */}
              <div
              className="w-full h-[138px] relative"
              style={{
                backgroundColor: scenario.color
              }}>
              
                <img
                src={scenario.imageUrl}
                alt={scenario.title}
                className="w-full h-full object-cover rounded-t-lg p-1.5" />
              
              </div>

              {/* Content Section */}
              <div className="p-4 flex flex-col gap-3">
                <div className="inline-flex">
                  <span className="bg-[#FFF9B5] text-[#FF4D01] font-inter font-bold text-[10.2px] leading-[16px] px-2 py-1 rounded-full">
                    {scenario.level}
                  </span>
                </div>

                <h3 className="font-inter font-bold text-[15.3px] leading-[28px] text-[#372213]">
                  {scenario.title}
                </h3>

                <p className="font-inter text-[11.9px] leading-[20px] text-[#4B5563]">
                  {scenario.description}
                </p>

                <button className="flex flex-row items-center gap-2 mt-2 group">
                  <span className="font-inter font-medium text-[11.9px] leading-[20px] text-[#FF4D01] group-hover:underline">
                    Start Practice
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#FF4D01]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>);

}
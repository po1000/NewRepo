import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigation } from './Navigation';
import { UserProfile } from './UserProfile';
import { UserStats } from './UserStats';
import { UnitSection, UnitData } from './UnitSection';
import { LessonCard } from './LessonCard';

// Placeholder lesson data — will be replaced with real data from Supabase
const beginnerUnits: UnitData[] = [
  {
    id: 'unit-1',
    title: 'Unit 1 — Greetings & Introductions',
    lessons: [
      {
        unitNumber: '1.1',
        title: 'Hello & Goodbye',
        color: '#FFE4CC',
        imageUrl: '',
        status: 'in-progress',
        progressPercent: 50,
      },
      {
        unitNumber: '1.2',
        title: 'My Name Is...',
        color: '#CCE4FF',
        imageUrl: '',
        status: 'locked',
      },
      {
        unitNumber: '1.3',
        title: 'Nice to Meet You',
        color: '#D4FFCC',
        imageUrl: '',
        status: 'locked',
      },
    ],
  },
  {
    id: 'unit-2',
    title: 'Unit 2 — Numbers & Colors',
    lessons: [
      {
        unitNumber: '2.1',
        title: 'Numbers 1-20',
        color: '#FFF3CC',
        imageUrl: '',
        status: 'locked',
      },
      {
        unitNumber: '2.2',
        title: 'Colors',
        color: '#FFCCCC',
        imageUrl: '',
        status: 'locked',
      },
    ],
  },
];

export function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Learner';

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Top Bar */}
      <header className="w-full px-4 sm:px-8 py-4 flex items-center justify-between max-w-[900px] mx-auto">
        <UserProfile username={username} />
        <UserStats xp="0" hearts={5} streak={0} />
      </header>

      {/* Navigation */}
      <Navigation
        onLearnLessonsClick={() => navigate('/dashboard')}
        onLearnSpeakWriteClick={() => navigate('/speak-and-write')}
        onGrammarClick={() => navigate('/grammar')}
        onCultureClick={() => navigate('/culture')}
        onCommunityClick={() => navigate('/community')}
      />

      {/* Main Content */}
      <main className="flex flex-col items-center gap-6 px-4 pb-12">
        {/* Current Lesson Card */}
        <LessonCard
          title="Lesson 1.1 — Hello & Goodbye"
          subtitle="Learn basic Spanish greetings"
          xpReward={25}
          goalText="Master 10 greeting phrases"
          progressPercent={0}
        />

        {/* Unit Sections */}
        <UnitSection
          level="A1 — Beginner"
          currentUnit="Unit 1"
          units={beginnerUnits}
          defaultExpanded={true}
        />

        {/* Sign Out */}
        <div className="w-full max-w-[632px] mx-auto flex justify-center pt-4">
          <button
            type="button"
            onClick={signOut}
            className="text-[13px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors underline">
            Sign Out
          </button>
        </div>
      </main>
    </div>
  );
}

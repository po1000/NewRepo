import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigation } from './Navigation';
import { UserProfile } from './UserProfile';
import { UserStats } from './UserStats';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Learner';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #FFE484 0%, #FFF8F0 40%)' }}>
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
        {/* Empty state — lessons will be fetched from Supabase */}
        <div className="w-full max-w-[632px] mx-auto bg-white rounded-[16px] p-8 text-center shadow-sm">
          <h2 className="font-inter font-bold text-[20.4px] leading-[32px] text-[#372213] mb-2">
            Welcome, {username}!
          </h2>
          <p className="font-inter text-[13.6px] leading-[24px] text-[#6B7280]">
            Your lessons will appear here once content is added to the database.
          </p>
        </div>

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

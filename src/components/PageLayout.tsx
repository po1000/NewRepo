import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigation } from './Navigation';
import { UserProfile } from './UserProfile';
import { UserStats } from './UserStats';

interface PageLayoutProps {
  children: React.ReactNode;
  stats?: { xp: string; hearts: number; streak: number };
  backgroundColor?: string;
  navOverrideClass?: string;
}

export function PageLayout({ children, stats, backgroundColor = '#FFEF74', navOverrideClass }: PageLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Learner';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  return (
    <div className="min-h-screen font-inter" style={{ backgroundColor }}>
      {/* Top Bar */}
      <header className="w-full px-4 sm:px-8 py-4 flex items-center justify-between max-w-[900px] mx-auto">
        <UserProfile
          username={username}
          avatarUrl={avatarUrl}
          userId={user?.id || ''}
        />
        {stats && (
          <UserStats
            xp={stats.xp}
            hearts={stats.hearts}
            streak={stats.streak}
          />
        )}
      </header>

      {/* Navigation */}
      <div className={navOverrideClass || ''}>
        <Navigation
          onLearnLessonsClick={() => navigate('/dashboard')}
          onLearnSpeakWriteClick={() => navigate('/speak-and-write')}
          onGrammarClick={() => navigate('/grammar')}
          onCultureClick={() => navigate('/culture')}
          onCommunityClick={() => navigate('/community')}
        />
      </div>

      {children}
    </div>
  );
}

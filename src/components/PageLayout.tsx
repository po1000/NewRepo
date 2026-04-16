import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigation } from './Navigation';
import { UserProfile } from './UserProfile';
import { UserStats } from './UserStats';
import { SettingsPanel } from './SettingsPanel';

interface PageLayoutProps {
  children: React.ReactNode;
  stats?: { xp: string; hearts: number; streak: number };
  backgroundColor?: string;
  navOverrideClass?: string;
}

export function PageLayout({ children, stats, backgroundColor = '#FFEF74', navOverrideClass }: PageLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Learner';
  const storedAvatar = user?.id ? localStorage.getItem(`avatar_url_${user.id}`) : null;
  const avatarUrl = storedAvatar || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  return (
    <div className="min-h-screen font-inter" style={{ backgroundColor }}>
      {/* Top Bar */}
      <header className="w-full px-4 sm:px-8 py-4 flex items-center justify-between max-w-[900px] mx-auto relative z-50">
        <UserProfile
          username={username}
          avatarUrl={avatarUrl}
          userId={user?.id || ''}
        />
        <div className="flex items-center gap-3">
          {stats && (
            <UserStats
              xp={stats.xp}
              hearts={stats.hearts}
              streak={stats.streak}
            />
          )}
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />

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

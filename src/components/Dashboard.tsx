import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Navigation } from './Navigation';
import { UserProfile } from './UserProfile';
import { UserStats } from './UserStats';
import { UnitSection, UnitData } from './UnitSection';

interface SubunitRow {
  subunit_id: number;
  subunit_code: string;
  title: string;
  description: string;
  image_url: string | null;
  goal_text: string | null;
  sort_order: number;
}

interface UnitRow {
  unit_id: number;
  unit_number: number;
  title: string;
  description: string;
  sort_order: number;
  cefr_level_id: number;
  cefr_levels: { code: string; name: string };
  subunits: SubunitRow[];
}

// Map CEFR codes to tile colors
const TILE_COLORS: Record<string, string[]> = {
  A1: ['#FFE4CC', '#CCE4FF', '#D4FFCC', '#FFF3CC', '#FFCCCC', '#E4CCFF'],
  A2: ['#FFDDE4', '#CCF5FF', '#E8FFCC', '#FFE8CC', '#CCFFE4', '#FFD4CC'],
};

export function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [unitsByLevel, setUnitsByLevel] = useState<Record<string, UnitData[]>>({});
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ total_xp: 0, hearts: 5, current_streak: 0 });

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Learner';

  useEffect(() => {
    async function fetchData() {
      // Fetch units with their subunits and CEFR level
      const { data: units, error } = await supabase
        .from('units')
        .select(`
          unit_id, unit_number, title, description, sort_order, cefr_level_id,
          cefr_levels ( code, name ),
          subunits ( subunit_id, subunit_code, title, description, image_url, goal_text, sort_order )
        `)
        .order('sort_order');

      if (error) {
        console.error('Error fetching units:', error);
        setLoading(false);
        return;
      }

      // Fetch user stats
      if (user) {
        const { data: stats } = await supabase
          .from('user_stats')
          .select('total_xp, hearts, current_streak')
          .eq('user_id', user.id)
          .single();
        if (stats) setUserStats(stats);
      }

      // Group units by CEFR level
      const grouped: Record<string, UnitData[]> = {};

      (units as UnitRow[])?.forEach((unit) => {
        const cefrCode = unit.cefr_levels?.code || 'A1';
        const cefrName = unit.cefr_levels?.name || 'Beginner';
        const levelKey = `${cefrCode} — ${cefrName}`;

        if (!grouped[levelKey]) grouped[levelKey] = [];

        const colors = TILE_COLORS[cefrCode] || TILE_COLORS['A1'];
        const sortedSubunits = (unit.subunits || []).sort((a, b) => a.sort_order - b.sort_order);

        grouped[levelKey].push({
          id: `unit-${unit.unit_id}`,
          title: `Unit ${unit.unit_number} — ${unit.title}`,
          lessons: sortedSubunits.map((sub, i) => ({
            unitNumber: sub.subunit_code,
            title: sub.title,
            color: colors[i % colors.length],
            imageUrl: sub.image_url || '',
            status: 'locked' as const,
          })),
        });
      });

      setUnitsByLevel(grouped);
      setLoading(false);
    }

    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #FFE484 0%, #FFF8F0 40%)' }}>
      {/* Top Bar */}
      <header className="w-full px-4 sm:px-8 py-4 flex items-center justify-between max-w-[900px] mx-auto">
        <UserProfile username={username} />
        <UserStats
          xp={userStats.total_xp.toLocaleString()}
          hearts={userStats.hearts}
          streak={userStats.current_streak}
        />
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
        {loading ? (
          <div className="w-full max-w-[632px] mx-auto bg-white rounded-[16px] p-8 text-center shadow-sm">
            <p className="font-inter text-[13.6px] text-[#6B7280]">Loading lessons...</p>
          </div>
        ) : Object.keys(unitsByLevel).length === 0 ? (
          <div className="w-full max-w-[632px] mx-auto bg-white rounded-[16px] p-8 text-center shadow-sm">
            <h2 className="font-inter font-bold text-[20.4px] leading-[32px] text-[#372213] mb-2">
              Welcome, {username}!
            </h2>
            <p className="font-inter text-[13.6px] leading-[24px] text-[#6B7280]">
              Your lessons will appear here once content is added to the database.
            </p>
          </div>
        ) : (
          Object.entries(unitsByLevel).map(([levelKey, units]) => (
            <UnitSection
              key={levelKey}
              level={levelKey}
              currentUnit=""
              units={units}
              defaultExpanded={levelKey.startsWith('A1')}
            />
          ))
        )}

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

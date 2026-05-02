import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { UnitSection, UnitData } from './UnitSection';
import { SubunitDetailModal } from './SubunitDetailModal';
import { PageLayout } from './PageLayout';
import { usePageTitle } from '../hooks/usePageTitle';

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
  cefr_levels: { code: string; title: string };
  subunits: SubunitRow[];
}

// Map CEFR level + subunit code to exact background colors
const SUBUNIT_COLORS: Record<string, string> = {
  'A1:1.1': '#FB3D3E', 'A1:1.2': '#FF8543', 'A1:2.1': '#1AD2CC', 'A1:2.2': '#6499FC',
  'A1:3.1': '#FF5B1F', 'A1:4.1': '#015CE7',
  'A2:1.1': '#BD55DD', 'A2:2.1': '#FFE101', 'A2:3.1': '#4CBC26', 'A2:4.1': '#F64297',
};

interface SubunitProgress {
  totalTerms: number;
  seenTerms: number;
  masteredTerms: number;
}

export function Dashboard() {
  usePageTitle('Dashboard');
  const { user, signOut } = useAuth();
  const { t, showInstructions } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [fetchKey, setFetchKey] = useState(0);
  const [rawUnits, setRawUnits] = useState<UnitRow[]>([]);
  const [subunitProgressMap, setSubunitProgressMap] = useState<Record<number, SubunitProgress>>({});
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ total_xp: 0, badge_count: 0, current_streak: 0, longest_streak: 0 });
  const [selectedSubunit, setSelectedSubunit] = useState<{ subunitId: number; subunitCode: string; title: string; goalText: string } | null>(null);
  const [lastLesson, setLastLesson] = useState<{ subunitId: number; subunitCode: string; title: string; goalText: string; vocabPreview: string; progressPercent: number } | null>(null);
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Learner';

  // Force refetch when navigating back to dashboard
  useEffect(() => {
    setFetchKey(prev => prev + 1);
  }, [location.key]);

  useEffect(() => {
    async function fetchData() {
      // Fetch units with their subunits and CEFR level
      const { data: units, error } = await supabase
        .from('units')
        .select(`
          unit_id, unit_number, title, description, sort_order, cefr_level_id,
          cefr_levels ( code, title ),
          subunits ( subunit_id, subunit_code, title, description, image_url, goal_text, sort_order )
        `)
        .order('sort_order');

      if (error) {
        console.error('Error fetching units:', error);
        setLoading(false);
        return;
      }

      // Fetch user stats (read-only — streak only increments on lesson completion)
      if (user) {
        const [
          { data: stats },
          { data: userBadgesList },
          { data: allBadgesList },
        ] = await Promise.all([
          supabase
            .from('user_stats')
            .select('total_xp, current_streak, longest_streak, lessons_completed, updated_at')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('user_badges')
            .select('badge_id')
            .eq('user_id', user.id),
          supabase
            .from('badges')
            .select('badge_id'),
        ]);

        const validBadgeIds = new Set((allBadgesList || []).map((b: any) => b.badge_id));
        const badgeCount = (userBadgesList || []).filter((ub: any) => validBadgeIds.has(ub.badge_id)).length;

        setUserStats({
          total_xp: stats?.total_xp || 0,
          current_streak: stats?.current_streak || 0,
          longest_streak: stats?.longest_streak || 0,
          badge_count: badgeCount,
        });
      }

      // Gather all subunit IDs to fetch progress
      const allSubunitIds: number[] = [];
      (units as UnitRow[])?.forEach(unit => {
        unit.subunits?.forEach(sub => allSubunitIds.push(sub.subunit_id));
      });

      // Fetch term counts per subunit and user progress
      const progressMap: Record<number, SubunitProgress> = {};

      if (allSubunitIds.length > 0) {
        // Get total terms per subunit
        const { data: subunitTermCounts } = await supabase
          .from('subunit_terms')
          .select('subunit_id, term_id')
          .in('subunit_id', allSubunitIds);

        // Group by subunit
        const termsBySubunit: Record<number, number[]> = {};
        subunitTermCounts?.forEach((st: any) => {
          if (!termsBySubunit[st.subunit_id]) termsBySubunit[st.subunit_id] = [];
          termsBySubunit[st.subunit_id].push(st.term_id);
        });

        // Get user progress for all terms
        if (user) {
          const allTermIds = subunitTermCounts?.map((st: any) => st.term_id) || [];
          const uniqueTermIds = [...new Set(allTermIds)];

          if (uniqueTermIds.length > 0) {
            const { data: progress } = await supabase
              .from('user_term_progress')
              .select('term_id, status')
              .eq('user_id', user.id)
              .in('term_id', uniqueTermIds);

            const termStatusMap: Record<number, string> = {};
            progress?.forEach((p: any) => {
              termStatusMap[p.term_id] = p.status;
            });

            // Calculate progress per subunit
            for (const subId of allSubunitIds) {
              const termIds = termsBySubunit[subId] || [];
              const total = termIds.length;
              let seen = 0;
              let mastered = 0;
              for (const tid of termIds) {
                const status = termStatusMap[tid];
                if (status === 'seen' || status === 'learning' || status === 'reinforced') seen++;
                if (status === 'mastered' || status === 'learnt') mastered++;
              }
              progressMap[subId] = { totalTerms: total, seenTerms: seen + mastered, masteredTerms: mastered };
            }
          }
        }

        // Fill in subunits without progress data
        for (const subId of allSubunitIds) {
          if (!progressMap[subId]) {
            progressMap[subId] = { totalTerms: termsBySubunit[subId]?.length || 0, seenTerms: 0, masteredTerms: 0 };
          }
        }
      }

      setRawUnits((units as UnitRow[]) || []);
      setSubunitProgressMap(progressMap);

      // Load last lesson for "Continue Lesson" card
      if (user) {
        try {
          const raw = localStorage.getItem(`last_lesson_${user.id}`);
          if (raw) {
            const saved = JSON.parse(raw);
            const prog = progressMap[saved.subunitId];
            const total = prog?.totalTerms || 0;
            const seen = prog?.seenTerms || 0;
            const pct = total > 0 ? Math.round((seen / total) * 100) : 0;
            if (pct < 100) {
              setLastLesson({
                subunitId: saved.subunitId,
                subunitCode: saved.subunitCode,
                title: saved.title,
                goalText: saved.goalText || '',
                vocabPreview: saved.vocabPreview || '',
                progressPercent: pct,
              });
            }
          }
        } catch {}
      }

      setLoading(false);
    }

    fetchData();
  }, [user, fetchKey]);

  const unitsByLevel = useMemo(() => {
    const grouped: Record<string, UnitData[]> = {};
    rawUnits.forEach((unit) => {
      const cefrCode = unit.cefr_levels?.code || 'A1';
      const cefrName = unit.cefr_levels?.title || 'Beginner';
      const levelKey = `${cefrCode}:${cefrName}`;
      if (!grouped[levelKey]) grouped[levelKey] = [];
      const sortedSubunits = (unit.subunits || []).sort((a, b) => a.sort_order - b.sort_order);
      grouped[levelKey].push({
        id: `unit-${unit.unit_id}`,
        title: `${t('label.unit')} ${unit.unit_number}: ${t(`unit.${unit.title}`)}`,
        lessons: sortedSubunits.map((sub) => {
          const prog = subunitProgressMap[sub.subunit_id];
          const total = prog?.totalTerms || 0;
          const seen = prog?.seenTerms || 0;
          const pct = total > 0 ? Math.round((seen / total) * 100) : 0;
          let status: 'completed' | 'in-progress' | 'locked' = 'locked';
          if (pct >= 100) status = 'completed';
          else if (seen > 0) status = 'in-progress';
          return {
            unitNumber: sub.subunit_code,
            title: t(`sub.${sub.title}`),
            color: SUBUNIT_COLORS[`${cefrCode}:${sub.subunit_code}`] || '#D9D9D9',
            imageUrl: sub.image_url || '',
            status,
            progressPercent: pct,
            subunitId: sub.subunit_id,
            goalText: sub.goal_text || '',
            onClick: () => setSelectedSubunit({
              subunitId: sub.subunit_id,
              subunitCode: sub.subunit_code,
              title: sub.title,
              goalText: sub.goal_text || '',
            }),
          };
        }),
      });
    });
    return grouped;
  }, [rawUnits, subunitProgressMap, t]);

  return (
    <PageLayout
      stats={{
        xp: userStats.total_xp.toLocaleString(),
        hearts: userStats.badge_count,
        streak: userStats.current_streak,
        longestStreak: userStats.longest_streak,
      }}
    >
      {/* Main Content */}
      <main className="flex flex-col items-center gap-6 px-4 pb-12">
        {/* Welcome Back message */}
        <h1 className="w-full max-w-[632px] mx-auto font-inter font-normal text-[28px] leading-[36px] text-[#372213] text-center mt-8">
          {t('ui.welcomeBack')}, {username}
        </h1>

        {showInstructions && (
          <div className="w-full max-w-[632px] mx-auto bg-white/80 rounded-[12px] px-4 py-3 shadow-sm border border-[#F97316]/20">
            <p className="font-inter text-[13px] leading-[20px] text-[#372213]">
              {t('instructions.dashboard')}
            </p>
          </div>
        )}
        {/* Continue Lesson Card */}
        {!loading && lastLesson && (
          <div className="w-full max-w-[632px] mx-auto bg-[#FFFDF5] rounded-[16px] p-5 shadow-sm border-2 border-[#FFE082]">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-inter font-bold text-[17px] text-[#372213] flex-1 min-w-0 mr-3">
                {t('label.unit')} {lastLesson.subunitCode}: {t(`sub.${lastLesson.title}`)}
              </h3>
              <p className="font-inter font-semibold text-[13px] text-[#FF4D01] shrink-0">+20 {t('resume.xpReward')}</p>
            </div>
            {lastLesson.goalText && (
              <p className="font-inter italic text-[12px] text-[#372213] mb-1">"{lastLesson.goalText}"</p>
            )}
            <p className="font-inter text-[13px] text-[#372213] mb-2">
              {t('resume.vocab')} {lastLesson.vocabPreview}....
            </p>
            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-[8px] bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-[#FF4D01]"
                  style={{ width: `${lastLesson.progressPercent}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => navigate('/lesson', { state: { subunitId: lastLesson.subunitId, subunitCode: lastLesson.subunitCode, title: lastLesson.title, goalText: lastLesson.goalText } })}
              className="w-full py-3 rounded-[12px] bg-[#E8501E] hover:bg-[#D4461A] active:bg-[#C03F17] text-white font-inter font-bold text-[15px] transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              {t('resume.continueLesson')}
            </button>
          </div>
        )}

        {loading ? (
          <div className="w-full max-w-[632px] mx-auto bg-white rounded-[16px] p-8 text-center shadow-sm">
            <p className="font-inter text-[13.6px] text-[#372213]">{t('lesson.loading')}</p>
          </div>
        ) : Object.keys(unitsByLevel).length === 0 ? (
          <div className="w-full max-w-[632px] mx-auto bg-white rounded-[16px] p-8 text-center shadow-sm">
            <h2 className="font-inter font-bold text-[20.4px] leading-[32px] text-[#372213] mb-2">
              {t('ui.welcome')}, {username}!
            </h2>
            <p className="font-inter text-[13.6px] leading-[24px] text-[#372213]">
              Your lessons will appear here once content is added to the database.
            </p>
          </div>
        ) : (
          Object.entries(unitsByLevel).map(([levelKey, units]) => {
            const [code, name] = levelKey.split(':');
            const displayLevel = `${code}: ${t(`cefr.${name}`)}`;
            return (
              <UnitSection
                key={levelKey}
                level={displayLevel}
                currentUnit=""
                units={units}
                defaultExpanded={levelKey.startsWith('A1')}
              />
            );
          })
        )}

        {/* Sign Out */}
        <div className="w-full max-w-[632px] mx-auto flex justify-center pt-4">
          <button
            type="button"
            onClick={signOut}
            className="text-[13px] text-[#372213] hover:text-[#372213] transition-colors underline">
            {t('ui.signOut')}
          </button>
        </div>
      </main>

      {selectedSubunit && (
        <SubunitDetailModal
          key={`${selectedSubunit.subunitId}-${Date.now()}`}
          subunitId={selectedSubunit.subunitId}
          subunitCode={selectedSubunit.subunitCode}
          title={selectedSubunit.title}
          goalText={selectedSubunit.goalText}
          userId={user?.id || ''}
          onClose={() => setSelectedSubunit(null)}
          onStartLesson={() => {
            setSelectedSubunit(null);
            navigate('/lesson', { state: { subunitId: selectedSubunit.subunitId, subunitCode: selectedSubunit.subunitCode, title: selectedSubunit.title, goalText: selectedSubunit.goalText } });
          }}
        />
      )}
    </PageLayout>
  );
}

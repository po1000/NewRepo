import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { PageLayout } from '../components/PageLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';

interface Badge {
  badge_id: number;
  label: string;
  description: string;
  icon_url: string | null;
  criteria_type: string;
  criteria_value: number;
  earned: boolean;
  earned_at: string | null;
  current_progress: number;
}

export function Badges() {
  usePageTitle('Badges');
  const { user } = useAuth();
  const { t, showInstructions } = useLanguage();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBadges() {
      if (!user) return;

      // Fetch all badges, user earned badges, user stats, and correct answer count in parallel
      const [
        { data: allBadges },
        { data: userBadges },
        { data: stats },
        { count: correctAnswerCount },
      ] = await Promise.all([
        supabase
          .from('badges')
          .select('badge_id, label, description, icon_url, criteria_type, criteria_value')
          .order('badge_id'),
        supabase
          .from('user_badges')
          .select('badge_id, earned_at')
          .eq('user_id', user.id),
        supabase
          .from('user_stats')
          .select('lessons_completed, current_streak')
          .eq('user_id', user.id)
          .single(),
        // Count terms where the user has answered correctly (status beyond 'seen')
        supabase
          .from('user_term_progress')
          .select('term_id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('status', ['learning', 'reinforced', 'learnt']),
      ]);

      const earnedMap = new Map<number, string>();
      userBadges?.forEach((ub: any) => {
        earnedMap.set(ub.badge_id, ub.earned_at);
      });

      // Build a lookup for current progress by criteria_type
      const progressLookup: Record<string, number> = {
        lessons_completed: stats?.lessons_completed || 0,
        streak_days: stats?.current_streak || 0,
        correct_answers: correctAnswerCount || 0,
      };

      const badgeList: Badge[] = (allBadges || []).map((b: any) => ({
        ...b,
        earned: earnedMap.has(b.badge_id),
        earned_at: earnedMap.get(b.badge_id) || null,
        current_progress: progressLookup[b.criteria_type] || 0,
      }));

      setBadges(badgeList);
      setLoading(false);
    }

    fetchBadges();
  }, [user]);

  return (
    <PageLayout>
      <main className="max-w-[632px] mx-auto px-4 pb-12">
        <h1 className="font-inter font-bold text-[22px] text-[#372213] mb-4">My Badges</h1>
        {showInstructions && (
          <div className="bg-white/80 rounded-[12px] px-4 py-3 shadow-sm border border-[#F97316]/20 mb-4">
            <p className="font-inter text-[13px] leading-[20px] text-[#6B7280]">
              {t('instructions.badges')}
            </p>
          </div>
        )}
        {loading ? (
          <p className="text-center text-[#9CA3AF] py-8">Loading badges...</p>
        ) : badges.length === 0 ? (
          <p className="text-center text-[#9CA3AF] py-8">No badges available yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge) => {
              const pct = badge.earned
                ? 100
                : Math.min(Math.round((badge.current_progress / badge.criteria_value) * 100), 100);

              return (
                <div
                  key={badge.badge_id}
                  className={`flex flex-col items-center p-5 rounded-[16px] shadow-sm transition-all ${
                    badge.earned
                      ? 'bg-gradient-to-b from-[#FFF8F0] to-white border-2 border-[#22C55E]'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                      badge.earned ? 'bg-[#FFF3E0]' : 'bg-gray-100'
                    }`}>
                      {badge.icon_url ? (
                        <img
                          src={badge.icon_url}
                          alt={badge.label}
                          className={`w-10 h-10 object-contain ${badge.earned ? '' : 'opacity-40 grayscale'}`}
                        />
                      ) : (
                        <img
                          src="/badges-icon.svg"
                          alt={badge.label}
                          className={`w-10 h-10 object-contain ${badge.earned ? '' : 'opacity-40 grayscale'}`}
                        />
                      )}
                    </div>
                    {badge.earned && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center shadow">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <h3 className="font-inter font-bold text-[14px] text-[#372213] text-center">
                    {badge.label}
                  </h3>
                  <p className="font-inter text-[12px] text-[#6B7280] text-center mt-1">
                    {badge.description}
                  </p>

                  {/* Progress bar or green tick */}
                  <div className="w-full mt-3">
                    {badge.earned ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4 text-[#22C55E]" strokeWidth={3} />
                        <span className="font-inter text-[12px] font-bold text-[#22C55E]">
                          Completed!
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-inter text-[11px] font-semibold text-[#6B7280]">
                            {badge.current_progress} / {badge.criteria_value}
                          </span>
                          <span className="font-inter text-[11px] font-semibold text-[#6B7280]">
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full h-[6px] bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: '#F97316',
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {badge.earned && badge.earned_at && (
                    <span className="font-inter text-[11px] text-[#22C55E] mt-2 font-medium">
                      Earned {new Date(badge.earned_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </PageLayout>
  );
}

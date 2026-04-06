import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Badge {
  badge_id: number;
  label: string;
  description: string;
  icon_url: string | null;
  criteria_type: string;
  criteria_value: number;
  earned: boolean;
  earned_at: string | null;
}

export function Badges() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBadges() {
      if (!user) return;

      // Fetch all badges
      const { data: allBadges } = await supabase
        .from('badges')
        .select('badge_id, label, description, icon_url, criteria_type, criteria_value')
        .order('badge_id');

      // Fetch user's earned badges
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id, earned_at')
        .eq('user_id', user.id);

      const earnedMap = new Map<number, string>();
      userBadges?.forEach((ub: any) => {
        earnedMap.set(ub.badge_id, ub.earned_at);
      });

      const badgeList: Badge[] = (allBadges || []).map((b: any) => ({
        ...b,
        earned: earnedMap.has(b.badge_id),
        earned_at: earnedMap.get(b.badge_id) || null,
      }));

      setBadges(badgeList);
      setLoading(false);
    }

    fetchBadges();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Header */}
      <header className="w-full px-4 sm:px-8 py-4 max-w-[632px] mx-auto flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#372213]" />
        </button>
        <h1 className="font-inter font-bold text-[22px] text-[#372213]">My Badges</h1>
      </header>

      <main className="max-w-[632px] mx-auto px-4 pb-12">
        {loading ? (
          <p className="text-center text-[#9CA3AF] py-8">Loading badges...</p>
        ) : badges.length === 0 ? (
          <p className="text-center text-[#9CA3AF] py-8">No badges available yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.badge_id}
                className={`flex flex-col items-center p-5 rounded-[16px] shadow-sm transition-all ${
                  badge.earned
                    ? 'bg-white border-2 border-[#F97316]'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-[#FFF3E0] flex items-center justify-center mb-3">
                  {badge.icon_url ? (
                    <img src={badge.icon_url} alt={badge.label} className="w-10 h-10 object-contain" />
                  ) : (
                    <img src="/badges-icon.svg" alt={badge.label} className="w-10 h-10 object-contain" />
                  )}
                </div>
                <h3 className="font-inter font-bold text-[14px] text-[#372213] text-center">
                  {badge.label}
                </h3>
                <p className="font-inter text-[12px] text-[#6B7280] text-center mt-1">
                  {badge.description}
                </p>
                {badge.earned && badge.earned_at && (
                  <span className="font-inter text-[11px] text-[#F97316] mt-2">
                    Earned {new Date(badge.earned_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

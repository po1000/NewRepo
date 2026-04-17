import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/PageLayout';
import { GrammarBreadcrumb } from '../components/GrammarBreadcrumb';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

interface VerbItem {
  verb_id: number;
  infinitive: string;
  english_meaning: string;
  is_irregular: boolean;
}

interface VerbListProps {
  categoryFilter: string; // 'ar' | 'er' | 'ir'
}

const CHIP_COLORS: Record<string, string> = {
  ar: '#A9DEFF',
  er: '#FFEB15',
  ir: '#FFB1B1',
};

const CATEGORY_LABELS: Record<string, string> = {
  ar: '-ar Verbs',
  er: '-er Verbs',
  ir: '-ir Verbs',
};

export function VerbList({ categoryFilter }: VerbListProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [verbs, setVerbs] = useState<VerbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadVerbs() {
      // Load verbs that end with the category suffix, OR are in that category
      const { data } = await supabase
        .from('verbs')
        .select('verb_id, infinitive, english_meaning, is_irregular, grammar_verb_categories ( name )')
        .order('infinitive');

      if (data) {
        // Filter: include verbs whose infinitive ends with -ar/-er/-ir, or whose category matches
        const filtered = data.filter((v: any) => {
          const catName = v.grammar_verb_categories?.name;
          const ending = v.infinitive.slice(-2);
          // llamarse → strip 'se' → llamar → 'ar'
          const baseEnding = v.infinitive.replace(/se$/, '').slice(-2);
          return catName === categoryFilter || ending === categoryFilter || baseEnding === categoryFilter;
        });

        setVerbs(filtered.map((v: any) => ({
          verb_id: v.verb_id,
          infinitive: v.infinitive,
          english_meaning: v.english_meaning,
          is_irregular: v.is_irregular,
        })));
      }
      setLoading(false);
    }
    loadVerbs();
  }, [categoryFilter]);

  const chipColor = CHIP_COLORS[categoryFilter] || '#FFEB15';
  const label = CATEGORY_LABELS[categoryFilter] || `${categoryFilter} Verbs`;

  const filteredVerbs = search
    ? verbs.filter(v => v.infinitive.toLowerCase().includes(search.toLowerCase()) || v.english_meaning.toLowerCase().includes(search.toLowerCase()))
    : verbs;

  const crumbs = [
    { label: 'Grammar', to: '/grammar' },
    { label: 'Conjugations', to: '/grammar' },
    { label },
  ];

  return (
    <PageLayout backgroundColor="#FF4D01" navOverrideClass="[&_a]:text-white [&_button]:text-white [&_svg]:text-white">
      <div className="absolute top-0 left-0 right-0 h-[120px] bg-[#FF7032] origin-top-left -skew-y-3 pointer-events-none" />

      <div className="max-w-[940px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-[684px] mx-auto pt-8 pb-20 px-4 sm:px-8">
          <GrammarBreadcrumb crumbs={crumbs} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
            <h1 className="font-inter font-bold text-[25.5px] leading-[36px] text-white">
              {label}
            </h1>
            <div className="w-full sm:w-[256px] h-[42px] bg-white rounded-lg border border-[#E5E7EB] flex items-center px-4 gap-3 shadow-sm">
              <Search className="w-4.5 h-4.5 text-[#B1B1B1]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('grammar.searchVerbs')}
                className="flex-1 bg-transparent border-none outline-none font-inter text-[16px] leading-[24px] text-[#372213] placeholder:text-[#B1B1B1]"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-white/80 text-[14px]">Loading verbs...</p>
          ) : filteredVerbs.length === 0 ? (
            <p className="text-white/80 text-[14px]">No verbs found.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {filteredVerbs.map(v => (
                <button
                  key={v.verb_id}
                  onClick={() => navigate(`/grammar/${categoryFilter}-verbs/${v.infinitive.toLowerCase()}`)}
                  className="h-[52px] px-6 flex items-center justify-center shadow-[1px_2px_4px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform"
                  style={{ backgroundColor: chipColor }}
                >
                  <span className="font-inter font-medium text-[20px] leading-[24px] text-[#372213] capitalize">
                    {v.infinitive}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

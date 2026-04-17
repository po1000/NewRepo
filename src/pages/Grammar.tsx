import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { GrammarBreadcrumb } from '../components/GrammarBreadcrumb';
import { usePageTitle } from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';

interface GrammarItem {
  label: string;
  path: string;
  category: 'conjugation' | 'topic';
  keywords: string[];
}

const grammarItems: GrammarItem[] = [
  // Conjugations
  { label: '-ar Verbs', path: '/grammar/ar-verbs', category: 'conjugation', keywords: ['ar', 'verbs', 'conjugation', 'hablar', 'regular'] },
  { label: '-er Verbs', path: '/grammar/er-verbs', category: 'conjugation', keywords: ['er', 'verbs', 'conjugation', 'comer', 'regular'] },
  { label: '-ir Verbs', path: '/grammar/ir-verbs', category: 'conjugation', keywords: ['ir', 'verbs', 'conjugation', 'vivir', 'regular'] },
  // Topics
  { label: 'Pronouns', path: '/grammar/pronouns', category: 'topic', keywords: ['pronouns', 'yo', 'tu', 'el', 'ella', 'subject', 'object'] },
  { label: 'Gender Rules', path: '/grammar/gender-rules', category: 'topic', keywords: ['gender', 'rules', 'masculine', 'feminine', 'el', 'la'] },
  { label: 'Ser vs Estar', path: '/grammar/er-verbs/ser', category: 'topic', keywords: ['ser', 'estar', 'to be', 'being', 'difference'] },
  { label: 'Adjective Agreement', path: '/grammar/adjective-agreement', category: 'topic', keywords: ['adjective', 'agreement', 'adjectives', 'agree', 'ending'] },
  { label: 'Plural Formation', path: '/grammar/plural-formation', category: 'topic', keywords: ['plural', 'formation', 'plurals', 'singular', 'es', 's'] },
  { label: 'Question Words', path: '/grammar/question-words', category: 'topic', keywords: ['question', 'words', 'interrogative', 'que', 'donde', 'como', 'cuando', 'por que'] },
  { label: 'Stem-changing Verbs Rules', path: '/grammar/stem-changing-verbs', category: 'topic', keywords: ['stem', 'changing', 'verbs', 'rules', 'stem-changing', 'irregular', 'boot'] },
  { label: 'Preterite Tense', path: '/grammar/preterite-tense', category: 'topic', keywords: ['preterite', 'tense', 'past', 'preterit', 'history'] },
];

function fuzzyMatch(query: string, item: GrammarItem): boolean {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return true;

  const normalizedLabel = item.label.toLowerCase();
  const normalizedKeywords = item.keywords.join(' ').toLowerCase();
  const searchable = `${normalizedLabel} ${normalizedKeywords}`;

  // Check if the full query is a substring of the searchable text
  if (searchable.includes(normalizedQuery)) return true;

  // Check if every word in the query appears somewhere in the searchable text
  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
  if (queryWords.length > 1 && queryWords.every(word => searchable.includes(word))) return true;

  // Check each query word individually for fuzzy matching (allow small edit distance)
  return queryWords.every(word => {
    // Direct substring check per word
    if (searchable.includes(word)) return true;

    // Check edit distance against each token in the searchable text
    const tokens = searchable.split(/\s+/);
    return tokens.some(token => {
      const maxDist = word.length <= 3 ? 1 : 2;
      return editDistance(word, token) <= maxDist;
    });
  });
}

function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

export function Grammar() {
  usePageTitle('Grammar');
  const navigate = useNavigate();
  const { t, showInstructions } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const crumbs = [{ label: 'Grammar' }];

  const filteredItems = searchQuery.trim()
    ? grammarItems.filter(item => fuzzyMatch(searchQuery, item))
    : [];

  return (
    <PageLayout backgroundColor="#FF4D01" navOverrideClass="[&_a]:text-[#FFFDE6] [&_button]:text-[#FFFDE6] [&_svg]:text-[#FFFDE6]">
      {/* Diagonal Swoosh Background */}
      <div className="absolute top-0 left-0 right-0 h-[120px] bg-[#FF7032] origin-top-left -skew-y-3 pointer-events-none" />

      <div className="max-w-[620px] mx-auto px-4 sm:px-6 pt-8 pb-20 relative z-10">
        <GrammarBreadcrumb crumbs={crumbs} />
        {showInstructions && (
          <div className="bg-white/90 rounded-[12px] px-4 py-3 shadow-sm border border-white/30 mb-4">
            <p className="font-inter text-[13px] leading-[20px] text-[#6B7280]">
              {t('instructions.grammar')}
            </p>
          </div>
        )}

        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="font-inter font-bold text-[25.5px] leading-[36px] text-white">
            Grammar
          </h1>
          <div className="w-full sm:w-[256px] h-[42px] bg-white rounded-lg border border-[#E5E7EB] flex items-center px-4 gap-3 shadow-sm">
            <Search className="w-4.5 h-4.5 text-[#B1B1B1]" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none font-inter text-[16px] leading-[24px] text-[#372213] placeholder:text-[#B1B1B1]" />
          </div>
        </div>

        {/* Search Results */}
        {searchQuery.trim() ? (
          <div className="flex flex-col gap-2">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="w-full h-[52px] bg-white rounded-lg border border-[#E5E7EB] flex items-center px-4 gap-3 hover:bg-gray-50 transition-colors text-left shadow-sm">
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    {item.label}
                  </span>
                  <span className="ml-auto font-inter text-[12px] leading-[16px] text-[#B1B1B1] capitalize">
                    {item.category}
                  </span>
                </button>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="font-inter text-[16px] text-white/80">
                  No results found for "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Cards Container */
          <div className="flex flex-col md:flex-row gap-4">
            {/* Conjugations Card */}
            <div className="w-full md:w-[219px] bg-[#FFE43C] rounded-xl p-6 flex flex-col gap-6">
              <h2 className="font-inter font-bold text-[16.3px] leading-[28px] text-[#372213]">
                Conjugations
              </h2>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate('/grammar/ar-verbs')}
                  className="w-full h-[48px] bg-[#A9DEFF] rounded-lg flex items-center px-4 hover:brightness-95 transition-all">
                  <span className="font-inter font-semibold text-[13.6px] leading-[24px] text-[#372213]">
                    -ar Verbs
                  </span>
                </button>
                <button
                  onClick={() => navigate('/grammar/er-verbs')}
                  className="w-full h-[48px] bg-[#E3B2FF] rounded-lg flex items-center px-4 hover:brightness-95 transition-all">
                  <span className="font-inter font-semibold text-[13.6px] leading-[24px] text-[#372213]">
                    -er Verbs
                  </span>
                </button>
                <button
                  onClick={() => navigate('/grammar/ir-verbs')}
                  className="w-full h-[48px] bg-[#FFB1B1] rounded-lg flex items-center px-4 hover:brightness-95 transition-all">
                  <span className="font-inter font-semibold text-[13.6px] leading-[24px] text-[#372213]">
                    -ir Verbs
                  </span>
                </button>
              </div>
            </div>

            {/* Topics Card */}
            <div className="flex-1 bg-[#FFE43C] rounded-xl p-6 flex flex-col gap-6">
              <h2 className="font-inter font-bold text-[16.3px] leading-[28px] text-[#372213]">
                Topics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/grammar/pronouns')}
                  className="h-[58px] bg-white rounded-lg border border-[#E5E7EB] flex items-center px-4 hover:bg-gray-50 transition-colors text-left">
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Pronouns
                  </span>
                </button>
                <button
                  onClick={() => navigate('/grammar/gender-rules')}
                  className="h-[58px] bg-white rounded-lg border border-[#E5E7EB] flex items-center px-4 hover:bg-gray-50 transition-colors text-left">
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Gender Rules
                  </span>
                </button>
                <button
                  onClick={() => navigate('/grammar/er-verbs/ser')}
                  className="h-[82px] bg-white rounded-lg border border-[#E5E7EB] flex items-center px-4 hover:bg-gray-50 transition-colors text-left">
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Ser vs Estar
                  </span>
                </button>
                <button
                  onClick={() => navigate('/grammar/adjective-agreement')}
                  className="h-[82px] bg-white rounded-lg border border-[#E5E7EB] flex flex-col justify-center px-4 hover:bg-gray-50 transition-colors text-left">
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Adjective
                  </span>
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Agreement
                  </span>
                </button>
                <button
                  onClick={() => navigate('/grammar/plural-formation')}
                  className="h-[58px] bg-white rounded-lg border border-[#E5E7EB] flex items-center px-4 hover:bg-gray-50 transition-colors text-left">
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Plural Formation
                  </span>
                </button>
                <button
                  onClick={() => navigate('/grammar/question-words')}
                  className="h-[58px] bg-white rounded-lg border border-[#E5E7EB] flex items-center px-4 hover:bg-gray-50 transition-colors text-left">
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Question Words
                  </span>
                </button>
                <button
                  onClick={() => navigate('/grammar/stem-changing-verbs')}
                  className="h-[82px] bg-white rounded-lg border border-[#E5E7EB] flex flex-col justify-center px-4 hover:bg-gray-50 transition-colors text-left">
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Stem-changing
                  </span>
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Verbs Rules
                  </span>
                </button>
                <button
                  onClick={() => navigate('/grammar/preterite-tense')}
                  className="h-[82px] bg-white rounded-lg border border-[#E5E7EB] flex items-center px-4 hover:bg-gray-50 transition-colors text-left">
                  <span className="font-inter font-medium text-[13.6px] leading-[24px] text-[#372213]">
                    Preterite Tense
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

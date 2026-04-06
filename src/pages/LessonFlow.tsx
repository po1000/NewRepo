import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  X,
  Flag,
  Volume2,
  Star,
  Turtle,
  ThumbsUp,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Term {
  term_id: number;
  spanish_text: string;
  english_text: string;
  part_of_speech: string;
  image_url: string | null;
  example_sentence_es: string | null;
  example_sentence_en: string | null;
}

interface GrammarHint {
  hint_id: number;
  hint_title: string;
  hint_text: string;
  hint_type: string;
}

interface LessonFlowProps {
  onClose: () => void;
}

function speakSpanish(text: string, slow: boolean) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = slow ? 0.5 : 0.9;
  utterance.pitch = 1;
  // Try to find a Spanish voice
  const voices = window.speechSynthesis.getVoices();
  const esVoice = voices.find(v => v.lang.startsWith('es'));
  if (esVoice) utterance.voice = esVoice;
  window.speechSynthesis.speak(utterance);
}

export function LessonFlow({ onClose }: LessonFlowProps) {
  const location = useLocation();
  const { user } = useAuth();
  const state = (location.state as { subunitId?: number; subunitCode?: string; title?: string }) || {};

  const [terms, setTerms] = useState<Term[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showGrammarHint, setShowGrammarHint] = useState(false);
  const [grammarHints, setGrammarHints] = useState<GrammarHint[]>([]);
  const [slowAudio, setSlowAudio] = useState(false);
  const [knownWords, setKnownWords] = useState<Set<number>>(new Set());
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSent, setReportSent] = useState(false);

  // Fetch terms for this subunit
  useEffect(() => {
    async function fetchTerms() {
      if (!state.subunitId) {
        setLoading(false);
        return;
      }

      const { data: subunitTerms } = await supabase
        .from('subunit_terms')
        .select('term_id, sort_order, terms ( term_id, spanish_text, english_text, part_of_speech, image_url, example_sentence_es, example_sentence_en )')
        .eq('subunit_id', state.subunitId)
        .order('sort_order');

      if (subunitTerms?.length) {
        const termsList: Term[] = subunitTerms.map((st: any) => ({
          term_id: st.terms.term_id,
          spanish_text: st.terms.spanish_text,
          english_text: st.terms.english_text,
          part_of_speech: st.terms.part_of_speech,
          image_url: st.terms.image_url,
          example_sentence_es: st.terms.example_sentence_es,
          example_sentence_en: st.terms.example_sentence_en,
        }));
        setTerms(termsList);
      }
      setLoading(false);
    }

    fetchTerms();

    // Preload voices for TTS
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, [state.subunitId]);

  // Fetch grammar hints for current term
  useEffect(() => {
    async function fetchHints() {
      if (!terms.length || currentIndex >= terms.length) return;
      const termId = terms[currentIndex].term_id;

      const { data: hintLinks } = await supabase
        .from('term_grammar_hints')
        .select('grammar_hints ( hint_id, hint_title, hint_text, hint_type )')
        .eq('term_id', termId);

      if (hintLinks?.length) {
        const hints: GrammarHint[] = hintLinks
          .map((h: any) => h.grammar_hints)
          .filter(Boolean);
        setGrammarHints(hints);
      } else {
        setGrammarHints([]);
      }
    }

    fetchHints();
    setShowGrammarHint(false);
  }, [currentIndex, terms]);

  // Filter out known words from active terms
  const activeTerms = terms.filter(t => !knownWords.has(t.term_id));
  const totalTerms = terms.length;
  const viewedCount = knownWords.size + currentIndex;
  const progressPercent = totalTerms > 0 ? Math.min(((viewedCount + 1) / totalTerms) * 100, 100) : 0;

  const currentTerm = activeTerms.length > 0 && currentIndex < activeTerms.length
    ? activeTerms[currentIndex]
    : null;

  const handleNext = useCallback(() => {
    if (!currentTerm) {
      onClose();
      return;
    }

    // Mark term as "seen" in user_term_progress
    if (user && currentTerm) {
      supabase.from('user_term_progress').upsert({
        user_id: user.id,
        term_id: currentTerm.term_id,
        status: 'seen',
      }, { onConflict: 'user_id,term_id' }).then(() => {});
    }

    if (currentIndex + 1 >= activeTerms.length) {
      // Lesson complete
      onClose();
    } else {
      setCurrentIndex(currentIndex + 1);
      setShowGrammarHint(false);
      setShowReport(false);
      setReportText('');
      setReportSent(false);
    }
  }, [currentIndex, activeTerms, currentTerm, user, onClose]);

  const handleKnown = useCallback(() => {
    if (!currentTerm) return;

    // Mark as mastered
    if (user) {
      supabase.from('user_term_progress').upsert({
        user_id: user.id,
        term_id: currentTerm.term_id,
        status: 'mastered',
      }, { onConflict: 'user_id,term_id' }).then(() => {});
    }

    setKnownWords(prev => new Set(prev).add(currentTerm.term_id));

    // Move to next if this was the current card
    if (currentIndex >= activeTerms.length - 1) {
      onClose();
    }
    // The card will be removed from activeTerms, so currentIndex stays
  }, [currentTerm, user, currentIndex, activeTerms, onClose]);

  const handlePlayAudio = useCallback(() => {
    if (currentTerm) {
      speakSpanish(currentTerm.spanish_text, slowAudio);
    }
  }, [currentTerm, slowAudio]);

  const handleReport = useCallback(async () => {
    if (!reportText.trim() || !user || !currentTerm) return;
    await supabase.from('issue_reports').insert({
      user_id: user.id,
      term_id: currentTerm.term_id,
      subunit_id: state.subunitId,
      issue_text: reportText.trim(),
    });
    setReportSent(true);
    setTimeout(() => {
      setShowReport(false);
      setReportText('');
      setReportSent(false);
    }, 1500);
  }, [reportText, user, currentTerm, state.subunitId]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center font-inter"
        style={{ background: 'radial-gradient(circle at top right, #FF1500 0%, #FFD905 100%)' }}>
        <p className="text-[#FFFDE6] text-lg">Loading lesson...</p>
      </div>
    );
  }

  if (!currentTerm) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center font-inter"
        style={{ background: 'radial-gradient(circle at top right, #FF1500 0%, #FFD905 100%)' }}>
        <div className="text-center">
          <p className="text-[#FFFDE6] text-xl font-bold mb-4">Lesson Complete!</p>
          <button onClick={onClose}
            className="px-8 py-3 bg-[#FFFDE6] rounded-xl text-[#FF4D01] font-bold text-[15px]">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center font-inter"
      style={{
        background: 'radial-gradient(circle at top right, #FF1500 0%, #FFD905 100%)',
      }}>

      <div className="w-full max-w-[684px] min-h-[688px] relative flex flex-col p-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-[#FFFDE6]" />
          </button>

          {/* Progress Bar */}
          <div className="flex-1 mx-8 h-3 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FFFDE6] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Flag / Report */}
          <button
            onClick={() => setShowReport(!showReport)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Flag className="w-6 h-6 text-[#FFFDE6]" />
          </button>
        </div>

        {/* Report Popup */}
        {showReport && (
          <div className="absolute top-20 right-8 w-[280px] bg-[#FFFDE6] rounded-xl p-4 shadow-xl z-50">
            <h3 className="font-bold text-[14px] text-[#372213] mb-2">Report an Issue</h3>
            {reportSent ? (
              <p className="text-[13px] text-[#3BBC00] font-medium">Thanks! Report sent.</p>
            ) : (
              <>
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Describe the issue..."
                  className="w-full h-20 px-3 py-2 rounded-lg border border-[#D5C4A5] text-[13px] text-[#372213] placeholder:text-[#C8B89B] focus:outline-none focus:border-[#FF4D01] resize-none"
                />
                <button
                  onClick={handleReport}
                  disabled={!reportText.trim()}
                  className="mt-2 w-full py-2 rounded-lg bg-[#FF4D01] text-white font-bold text-[13px] disabled:opacity-50">
                  Submit
                </button>
              </>
            )}
          </div>
        )}

        {/* Content Area — Flashcard */}
        <div className="flex-1 flex flex-col items-center">
          {/* Badge */}
          <div className="px-4 py-1 border border-[#FFFDE6] rounded-full mb-8">
            <span className="font-medium text-[14px] leading-[16px] text-[#FFFDE6] uppercase tracking-wider">
              Flashcard
            </span>
          </div>

          {/* Card */}
          <div className="w-full max-w-[422px] bg-[#FFFDE6] rounded-2xl p-8 flex flex-col items-center relative shadow-lg mb-8">
            {/* Image */}
            {currentTerm.image_url ? (
              <img
                src={currentTerm.image_url}
                alt={currentTerm.english_text}
                className="w-[235px] h-[157px] object-cover rounded-lg mb-12"
              />
            ) : (
              <div className="w-[235px] h-[157px] rounded-lg mb-12 bg-gradient-to-br from-[#FFE484] to-[#FFCA28] flex items-center justify-center">
                <span className="text-[40px]">📖</span>
              </div>
            )}

            {/* Speaker Button */}
            <button
              onClick={handlePlayAudio}
              className="absolute top-[180px] w-16 h-16 bg-white border-4 border-[#FF4D01] rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform">
              <Volume2 className="w-8 h-8 text-[#FF4D01]" />
            </button>

            {/* Spanish text */}
            <h2 className="font-bold text-[24px] leading-[48px] text-black mb-1">
              {currentTerm.spanish_text}
            </h2>

            {/* English text */}
            <span className="font-medium text-[20px] leading-[20px] text-[#FF4D01]">
              {currentTerm.english_text}
            </span>

            {/* Bottom Icons */}
            <button
              onClick={handleKnown}
              title="I already know this word"
              className={`absolute bottom-0 left-0 w-12 h-10 rounded-tr-2xl rounded-bl-2xl flex items-center justify-center transition-colors ${
                knownWords.has(currentTerm.term_id) ? 'bg-[#3BBC00]' : 'bg-[#FF4D01]'
              }`}>
              <ThumbsUp className="w-5 h-5 text-[#FFFDE6]" />
            </button>

            <button
              onClick={() => setSlowAudio(!slowAudio)}
              title={slowAudio ? 'Normal speed' : 'Slow audio'}
              className={`absolute bottom-0 right-0 w-12 h-10 rounded-tl-2xl rounded-br-2xl flex items-center justify-center transition-colors ${
                slowAudio ? 'bg-[#3BBC00]' : 'bg-[#FF4D01]'
              }`}>
              <Turtle className="w-5 h-5 text-[#FFFDE6]" />
            </button>
          </div>

          {/* Example Sentence */}
          {(currentTerm.example_sentence_es || currentTerm.example_sentence_en) && (
            <div className="text-center mb-4">
              {currentTerm.example_sentence_es && (
                <p className="font-medium italic text-[16.3px] leading-[28px] text-[#FFFDE6] mb-1">
                  " {currentTerm.example_sentence_es} "
                </p>
              )}
              {currentTerm.example_sentence_en && (
                <p className="italic text-[14.6px] leading-[24px] text-[#FFFDE6]">
                  {currentTerm.example_sentence_en}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-8 w-full max-w-[448px] mx-auto">
          {/* Grammar Hint */}
          <div className="relative">
            <button
              onClick={() => setShowGrammarHint(!showGrammarHint)}
              className="flex items-center gap-2 px-4 py-3 border-2 border-[#FFFDE6] rounded-xl bg-[#FF6200] text-[#FFFDE6] font-bold text-[14.6px] hover:bg-[#e55800] transition-colors">
              <Star className="w-4 h-4" />
              Grammar Hint
            </button>

            {/* Grammar Hint Popup */}
            {showGrammarHint && (
              <div className="absolute bottom-full left-0 mb-4 w-[300px] bg-[#FFFDE6] rounded-xl p-4 shadow-xl z-50">
                <div className="absolute -bottom-2 left-8 w-4 h-4 bg-[#FFFDE6] rotate-45" />
                <div className="relative z-10">
                  {grammarHints.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {grammarHints.map((hint) => (
                        <div key={hint.hint_id}>
                          <p className="font-bold text-[13px] text-[#F97316] mb-0.5">{hint.hint_title}</p>
                          <p className="text-[13px] leading-[18px] text-[#372213]">{hint.hint_text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-[#9CA3AF]">No grammar hints for this term.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Got it! / Next */}
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-[#FFFDE6] rounded-xl text-[#FF4D01] font-bold text-[14.6px] hover:bg-white transition-colors shadow-lg">
            {currentIndex === 0 ? 'Got it!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

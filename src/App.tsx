import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { AuthCallback } from './components/AuthCallback';
import { SetNewPasswordCard } from './components/SetNewPasswordCard';

// Lazy-loaded pages
const AuthPage = React.lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const DashboardPage = React.lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const LessonFlowPage = React.lazy(() => import('./pages/LessonFlow').then(m => ({ default: m.LessonFlow })));
const GrammarPage = React.lazy(() => import('./pages/Grammar').then(m => ({ default: m.Grammar })));
const ARVerbsPage = React.lazy(() => import('./pages/ARVerbs').then(m => ({ default: m.ARVerbs })));
const ERVerbsPage = React.lazy(() => import('./pages/ERVerbs').then(m => ({ default: m.ERVerbs })));
const IRVerbsPage = React.lazy(() => import('./pages/IRVerbs').then(m => ({ default: m.IRVerbs })));
const VerbConjugationPage = React.lazy(() => import('./pages/VerbConjugation').then(m => ({ default: m.VerbConjugation })));
const PronounsPage = React.lazy(() => import('./pages/Pronouns').then(m => ({ default: m.Pronouns })));
const CulturePage = React.lazy(() => import('./pages/Culture').then(m => ({ default: m.Culture })));
const MusicDancePage = React.lazy(() => import('./pages/MusicDance').then(m => ({ default: m.MusicDance })));
const FoodDrinkPage = React.lazy(() => import('./pages/FoodDrink').then(m => ({ default: m.FoodDrink })));
const RegionsLandmarksPage = React.lazy(() => import('./pages/RegionsLandmarks').then(m => ({ default: m.RegionsLandmarks })));
const HistoryPage = React.lazy(() => import('./pages/History').then(m => ({ default: m.History })));
const PianoTilesGamePage = React.lazy(() => import('./pages/PianoTilesGame').then(m => ({ default: m.PianoTilesGame })));
const SpeakAndWritePage = React.lazy(() => import('./pages/SpeakAndWrite').then(m => ({ default: m.SpeakAndWrite })));
const SpeakingPracticePage = React.lazy(() => import('./pages/SpeakingPractice').then(m => ({ default: m.SpeakingPractice })));
const RoleplayCompletePage = React.lazy(() => import('./pages/RoleplayComplete').then(m => ({ default: m.RoleplayComplete })));
const CommunityPage = React.lazy(() => import('./pages/Community').then(m => ({ default: m.Community })));
const BadgesPage = React.lazy(() => import('./pages/Badges').then(m => ({ default: m.Badges })));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#FF4D01] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
        <React.Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public auth routes */}
            <Route path="/" element={<PublicRoute><AuthPage /></PublicRoute>} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<SetNewPasswordCard />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/lesson" element={<ProtectedRoute><LessonFlowPage /></ProtectedRoute>} />

            {/* Grammar */}
            <Route path="/grammar" element={<ProtectedRoute><GrammarPage /></ProtectedRoute>} />
            <Route path="/grammar/ar-verbs" element={<ProtectedRoute><ARVerbsPage /></ProtectedRoute>} />
            <Route path="/grammar/er-verbs" element={<ProtectedRoute><ERVerbsPage /></ProtectedRoute>} />
            <Route path="/grammar/ir-verbs" element={<ProtectedRoute><IRVerbsPage /></ProtectedRoute>} />
            <Route path="/grammar/ar-verbs/:verb" element={<ProtectedRoute><VerbConjugationPage /></ProtectedRoute>} />
            <Route path="/grammar/er-verbs/:verb" element={<ProtectedRoute><VerbConjugationPage /></ProtectedRoute>} />
            <Route path="/grammar/ir-verbs/:verb" element={<ProtectedRoute><VerbConjugationPage /></ProtectedRoute>} />
            <Route path="/grammar/pronouns" element={<ProtectedRoute><PronounsPage /></ProtectedRoute>} />

            {/* Culture */}
            <Route path="/culture" element={<ProtectedRoute><CulturePage /></ProtectedRoute>} />
            <Route path="/culture/music-dance" element={<ProtectedRoute><MusicDancePage /></ProtectedRoute>} />
            <Route path="/culture/food-drink" element={<ProtectedRoute><FoodDrinkPage /></ProtectedRoute>} />
            <Route path="/culture/regions-landmarks" element={<ProtectedRoute><RegionsLandmarksPage /></ProtectedRoute>} />
            <Route path="/culture/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/culture/games/piano-tiles" element={<ProtectedRoute><PianoTilesGamePage /></ProtectedRoute>} />

            {/* Speak & Write */}
            <Route path="/speak-and-write" element={<ProtectedRoute><SpeakAndWritePage /></ProtectedRoute>} />
            <Route path="/speak-and-write/practice/:scenarioId" element={<ProtectedRoute><SpeakingPracticePage /></ProtectedRoute>} />
            <Route path="/speak-and-write/roleplay-complete" element={<ProtectedRoute><RoleplayCompletePage /></ProtectedRoute>} />

            {/* Community & Badges */}
            <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            <Route path="/badges" element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

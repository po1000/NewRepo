import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { AuthCallback } from './components/AuthCallback';
import { SetNewPasswordCard } from './components/SetNewPasswordCard';
import { CreateAccountCard } from './components/CreateAccountCard';
import { LoginCard } from './components/LoginCard';
import { ResetPasswordCard } from './components/ResetPasswordCard';
import { Dashboard } from './components/Dashboard';
import { LessonFlow } from './pages/LessonFlow';
import { SpeakAndWrite } from './pages/SpeakAndWrite';
import { SpeakingPractice } from './pages/SpeakingPractice';
import { RoleplayComplete } from './pages/RoleplayComplete';
import { Grammar } from './pages/Grammar';
import { ERVerbs } from './pages/ERVerbs';
import { SerConjugation } from './pages/SerConjugation';
import { Culture } from './pages/Culture';
import { MusicDance } from './pages/MusicDance';
import { RegionsLandmarks } from './pages/RegionsLandmarks';
import { FoodDrink } from './pages/FoodDrink';
import { History } from './pages/History';
import { Community } from './pages/Community';

type PageState = 'login' | 'create' | 'reset';

function AuthPages() {
  const [currentPage, setCurrentPage] = useState<PageState>('create');
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(to bottom left, #FF1500 0%, #FF9604 100%)' }}>
      {currentPage === 'create' && <CreateAccountCard onNavigate={setCurrentPage} />}
      {currentPage === 'login' && <LoginCard onNavigate={setCurrentPage} />}
      {currentPage === 'reset' && <ResetPasswordCard onNavigate={setCurrentPage} />}
    </main>
  );
}

function DashboardPage() {
  return <Dashboard />;
}

function LessonPage() {
  const navigate = useNavigate();
  return <LessonFlow onClose={() => navigate('/dashboard')} />;
}

function SpeakAndWritePage() {
  const navigate = useNavigate();
  return (
    <SpeakAndWrite
      onNavigateBack={() => navigate('/dashboard')}
      onScenarioClick={() => navigate('/speak-and-write/scenario')}
      onGrammarClick={() => navigate('/grammar')}
      onCultureClick={() => navigate('/culture')}
      onCommunityClick={() => navigate('/community')}
    />
  );
}

function SpeakingPracticePage() {
  const navigate = useNavigate();
  return (
    <SpeakingPractice
      onBack={() => navigate('/speak-and-write')}
      onRoleplayComplete={() => navigate('/speak-and-write/scenario/complete')}
    />
  );
}

function RoleplayCompletePage() {
  const navigate = useNavigate();
  return <RoleplayComplete onBack={() => navigate('/speak-and-write')} />;
}

function GrammarPage() {
  const navigate = useNavigate();
  return (
    <Grammar
      onNavigateBack={() => navigate('/dashboard')}
      onNavigateToERVerbs={() => navigate('/grammar/er-verbs')}
      onNavigateToSer={() => navigate('/grammar/er-verbs/ser-conjugation')}
      onLearnSpeakWriteClick={() => navigate('/speak-and-write')}
      onCultureClick={() => navigate('/culture')}
      onCommunityClick={() => navigate('/community')}
    />
  );
}

function ERVerbsPage() {
  const navigate = useNavigate();
  return (
    <ERVerbs
      onBack={() => navigate('/grammar')}
      onNavigateToSer={() => navigate('/grammar/er-verbs/ser-conjugation')}
      onLearnSpeakWriteClick={() => navigate('/speak-and-write')}
      onCultureClick={() => navigate('/culture')}
      onGrammarClick={() => navigate('/grammar')}
      onCommunityClick={() => navigate('/community')}
    />
  );
}

function SerConjugationPage() {
  const navigate = useNavigate();
  return (
    <SerConjugation
      onBack={() => navigate('/grammar/er-verbs')}
      onLearnSpeakWriteClick={() => navigate('/speak-and-write')}
      onCultureClick={() => navigate('/culture')}
      onGrammarClick={() => navigate('/grammar')}
      onCommunityClick={() => navigate('/community')}
    />
  );
}

function CulturePage() {
  const navigate = useNavigate();
  return (
    <Culture
      onNavigateBack={() => navigate('/dashboard')}
      onMusicDanceClick={() => navigate('/culture/music-dance')}
      onRegionsClick={() => navigate('/culture/regions-landmarks')}
      onFoodDrinkClick={() => navigate('/culture/food-drink')}
      onHistoryClick={() => navigate('/culture/history')}
      onLearnSpeakWriteClick={() => navigate('/speak-and-write')}
      onGrammarClick={() => navigate('/grammar')}
      onCommunityClick={() => navigate('/community')}
    />
  );
}

function MusicDancePage() {
  const navigate = useNavigate();
  return (
    <MusicDance
      onNavigateBack={() => navigate('/culture')}
      onLearnSpeakWriteClick={() => navigate('/speak-and-write')}
      onCultureClick={() => navigate('/culture')}
      onGrammarClick={() => navigate('/grammar')}
      onCommunityClick={() => navigate('/community')}
    />
  );
}

function RegionsLandmarksPage() {
  const navigate = useNavigate();
  return (
    <RegionsLandmarks
      onNavigateBack={() => navigate('/culture')}
      onLearnSpeakWriteClick={() => navigate('/speak-and-write')}
      onCultureClick={() => navigate('/culture')}
      onGrammarClick={() => navigate('/grammar')}
      onCommunityClick={() => navigate('/community')}
    />
  );
}

function FoodDrinkPage() {
  const navigate = useNavigate();
  return (
    <FoodDrink
      onNavigateBack={() => navigate('/culture')}
      onLearnSpeakWriteClick={() => navigate('/speak-and-write')}
      onCultureClick={() => navigate('/culture')}
      onGrammarClick={() => navigate('/grammar')}
      onCommunityClick={() => navigate('/community')}
    />
  );
}

function HistoryPage() {
  const navigate = useNavigate();
  return (
    <History
      onNavigateBack={() => navigate('/culture')}
      onLearnSpeakWriteClick={() => navigate('/speak-and-write')}
      onCultureClick={() => navigate('/culture')}
      onGrammarClick={() => navigate('/grammar')}
      onCommunityClick={() => navigate('/community')}
    />
  );
}

function CommunityPage() {
  const navigate = useNavigate();
  return (
    <Community
      onNavigateBack={() => navigate('/dashboard')}
      onLearnSpeakWriteClick={() => navigate('/speak-and-write')}
      onGrammarClick={() => navigate('/grammar')}
      onCultureClick={() => navigate('/culture')}
    />
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicRoute><AuthPages /></PublicRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/set-new-password" element={<SetNewPasswordCard />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/lesson" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
          <Route path="/speak-and-write" element={<ProtectedRoute><SpeakAndWritePage /></ProtectedRoute>} />
          <Route path="/speak-and-write/:scenarioSlug" element={<ProtectedRoute><SpeakingPracticePage /></ProtectedRoute>} />
          <Route path="/speak-and-write/:scenarioSlug/complete" element={<ProtectedRoute><RoleplayCompletePage /></ProtectedRoute>} />
          <Route path="/grammar" element={<ProtectedRoute><GrammarPage /></ProtectedRoute>} />
          <Route path="/grammar/er-verbs" element={<ProtectedRoute><ERVerbsPage /></ProtectedRoute>} />
          <Route path="/grammar/er-verbs/ser-conjugation" element={<ProtectedRoute><SerConjugationPage /></ProtectedRoute>} />
          <Route path="/culture" element={<ProtectedRoute><CulturePage /></ProtectedRoute>} />
          <Route path="/culture/music-dance" element={<ProtectedRoute><MusicDancePage /></ProtectedRoute>} />
          <Route path="/culture/regions-landmarks" element={<ProtectedRoute><RegionsLandmarksPage /></ProtectedRoute>} />
          <Route path="/culture/food-drink" element={<ProtectedRoute><FoodDrinkPage /></ProtectedRoute>} />
          <Route path="/culture/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

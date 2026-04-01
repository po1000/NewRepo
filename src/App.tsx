import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CreateAccountCard } from './components/CreateAccountCard';
import { LoginCard } from './components/LoginCard';
import { ResetPasswordCard } from './components/ResetPasswordCard';
import { SetNewPasswordCard } from './components/SetNewPasswordCard';
import { AuthCallback } from './components/AuthCallback';
import { Dashboard } from './components/Dashboard';

// New Magic Patterns page imports
import { UnitSection } from './components/UnitSection';
import { LessonModal } from './components/LessonModal';
import { SpeakAndWrite } from './pages/SpeakAndWrite';
import { Culture } from './pages/Culture';
import { SpeakingPractice } from './pages/SpeakingPractice';
import { LessonFlow } from './pages/LessonFlow';
import { Grammar } from './pages/Grammar';
import { ERVerbs } from './pages/ERVerbs';
import { SerConjugation } from './pages/SerConjugation';
import { RoleplayComplete } from './pages/RoleplayComplete';
import { Community } from './pages/Community';
import { MusicDance } from './pages/MusicDance';
import { RegionsLandmarks } from './pages/RegionsLandmarks';
import { FoodDrink } from './pages/FoodDrink';
import { History } from './pages/History';

type AuthPage = 'login' | 'create' | 'reset';

function AuthPages() {
  const [currentPage, setCurrentPage] = useState<AuthPage>('login');

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

function SetNewPasswordPage() {
  const navigate = useNavigate();

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(to bottom left, #FF1500 0%, #FF9604 100%)' }}>
      <SetNewPasswordCard onSuccess={() => navigate('/dashboard', { replace: true })} />
    </main>
  );
}

function DashboardPage() {
  const navigate = useNavigate();

  return <Dashboard />;
}

function LessonsPage() {
  const navigate = useNavigate();
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showLessonFlow, setShowLessonFlow] = useState(false);

  if (showLessonFlow) {
    return <LessonFlow onClose={() => setShowLessonFlow(false)} />;
  }

  return <DashboardPage />;
}

function SpeakAndWritePage() {
  const navigate = useNavigate();

  return (
    <SpeakAndWrite
      onNavigateBack={() => navigate('/dashboard')}
      onScenarioClick={() => navigate('/speaking-practice')}
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
      onGrammarClick={() => navigate('/grammar')}
      onLearnSpeakWriteClick={() => navigate('/speak-and-write')}
      onCultureClick={() => navigate('/culture')}
      onCommunityClick={() => navigate('/community')}
      onMusicDanceClick={() => navigate('/culture/music-dance')}
      onRegionsClick={() => navigate('/culture/regions-landmarks')}
      onFoodDrinkClick={() => navigate('/culture/food-drink')}
      onHistoryClick={() => navigate('/culture/history')}
    />
  );
}

function GrammarPage() {
  const navigate = useNavigate();

  return (
    <Grammar
      onNavigateBack={() => navigate('/dashboard')}
      onLearnSpeakWriteClick={() => navigate('/speak-and-write')}
      onCultureClick={() => navigate('/culture')}
      onNavigateToERVerbs={() => navigate('/grammar/er-verbs')}
      onNavigateToSer={() => navigate('/grammar/ser-conjugation')}
      onCommunityClick={() => navigate('/community')}
    />
  );
}

function ERVerbsPage() {
  const navigate = useNavigate();

  return (
    <ERVerbs
      onBack={() => navigate('/grammar')}
      onNavigateToSer={() => navigate('/grammar/ser-conjugation')}
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
      onBack={() => navigate('/grammar')}
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
      onCultureClick={() => navigate('/culture')}
      onGrammarClick={() => navigate('/grammar')}
    />
  );
}

function SpeakingPracticePage() {
  const navigate = useNavigate();

  return (
    <SpeakingPractice
      onBack={() => navigate('/speak-and-write')}
      onRoleplayComplete={() => navigate('/roleplay-complete')}
    />
  );
}

function RoleplayCompletePage() {
  const navigate = useNavigate();

  return (
    <RoleplayComplete
      onBack={() => navigate('/speak-and-write')}
    />
  );
}

function LessonFlowPage() {
  const navigate = useNavigate();

  return (
    <LessonFlow
      onClose={() => navigate('/dashboard')}
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
      onNavigateToRegion={(region) => navigate(`/culture/regions-landmarks`)}
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: 'linear-gradient(to bottom left, #FF1500 0%, #FF9604 100%)' }}>
        <div className="w-full max-w-[448px] bg-white rounded-xl border border-[#E5E7EB] p-8 text-center shadow-sm">
          <p className="text-[13.6px] text-[#6B7280]">Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: 'linear-gradient(to bottom left, #FF1500 0%, #FF9604 100%)' }}>
        <div className="w-full max-w-[448px] bg-white rounded-xl border border-[#E5E7EB] p-8 text-center shadow-sm">
          <p className="text-[13.6px] text-[#6B7280]">Loading...</p>
        </div>
      </main>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth routes */}
          <Route path="/" element={<PublicRoute><AuthPages /></PublicRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/set-new-password" element={<SetNewPasswordPage />} />

          {/* Protected app routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/lesson" element={<ProtectedRoute><LessonFlowPage /></ProtectedRoute>} />
          <Route path="/speak-and-write" element={<ProtectedRoute><SpeakAndWritePage /></ProtectedRoute>} />
          <Route path="/speaking-practice" element={<ProtectedRoute><SpeakingPracticePage /></ProtectedRoute>} />
          <Route path="/roleplay-complete" element={<ProtectedRoute><RoleplayCompletePage /></ProtectedRoute>} />
          <Route path="/grammar" element={<ProtectedRoute><GrammarPage /></ProtectedRoute>} />
          <Route path="/grammar/er-verbs" element={<ProtectedRoute><ERVerbsPage /></ProtectedRoute>} />
          <Route path="/grammar/ser-conjugation" element={<ProtectedRoute><SerConjugationPage /></ProtectedRoute>} />
          <Route path="/culture" element={<ProtectedRoute><CulturePage /></ProtectedRoute>} />
          <Route path="/culture/music-dance" element={<ProtectedRoute><MusicDancePage /></ProtectedRoute>} />
          <Route path="/culture/regions-landmarks" element={<ProtectedRoute><RegionsLandmarksPage /></ProtectedRoute>} />
          <Route path="/culture/food-drink" element={<ProtectedRoute><FoodDrinkPage /></ProtectedRoute>} />
          <Route path="/culture/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

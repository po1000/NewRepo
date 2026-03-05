import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CreateAccountCard } from './components/CreateAccountCard';
import { LoginCard } from './components/LoginCard';
import { ResetPasswordCard } from './components/ResetPasswordCard';
import { SetNewPasswordCard } from './components/SetNewPasswordCard';
import { AuthCallback } from './components/AuthCallback';
import { Dashboard } from './components/Dashboard';

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
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(to bottom left, #FF1500 0%, #FF9604 100%)' }}>
      <Dashboard />
    </main>
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
          <Route path="/" element={<PublicRoute><AuthPages /></PublicRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/set-new-password" element={<SetNewPasswordPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

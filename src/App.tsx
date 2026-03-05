import React, { useState } from 'react';
import { CreateAccountCard } from './components/CreateAccountCard';
import { LoginCard } from './components/LoginCard';
import { ResetPasswordCard } from './components/ResetPasswordCard';
type PageState = 'login' | 'create' | 'reset';
export function App() {
  const [currentPage, setCurrentPage] = useState<PageState>('create');
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center px-4 py-12"
      style={{
        background: 'linear-gradient(to bottom left, #FF1500 0%, #FF9604 100%)'
      }}>

      {currentPage === 'create' &&
      <CreateAccountCard onNavigate={setCurrentPage} />
      }
      {currentPage === 'login' && <LoginCard onNavigate={setCurrentPage} />}
      {currentPage === 'reset' &&
      <ResetPasswordCard onNavigate={setCurrentPage} />
      }
    </main>);

}
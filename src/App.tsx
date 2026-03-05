import React from 'react';
import { CreateAccountCard } from './components/CreateAccountCard';
export function App() {
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center px-4 py-12"
      style={{
        background: 'linear-gradient(to bottom left, #FF1500 0%, #FF9604 100%)'
      }}>

      <CreateAccountCard />
    </main>);

}
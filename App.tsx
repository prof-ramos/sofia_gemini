import React from 'react';
import { ChatInterface } from './components/ChatInterface';
import { Header } from './components/Header';

const App: React.FC = () => {
  return (
    // Changed h-screen to h-[100dvh] to handle mobile browser address bars correctly
    // Added supports-[height:100dvh]:h-[100dvh] for broader compatibility fallback
    <div className="flex flex-col h-screen supports-[height:100dvh]:h-[100dvh] bg-neutral text-slate-900 overflow-hidden font-sans">
      <Header />
      <main className="flex-1 relative flex flex-col overflow-hidden max-w-5xl mx-auto w-full shadow-xl bg-white border-x border-slate-200/50">
        <ChatInterface />
      </main>
    </div>
  );
};

export default App;
import React, { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { Header } from './components/Header';
import { AdminDashboard } from './components/AdminDashboard';
import { ConfigProvider } from './contexts/ConfigContext';
import { Settings } from 'lucide-react';
import { Button } from './components/ui/Button';

const AppContent: React.FC = () => {
  const [view, setView] = useState<'chat' | 'admin'>('chat');

  return (
    <div className="flex flex-col h-screen supports-[height:100dvh]:h-[100dvh] bg-neutral text-slate-900 overflow-hidden font-sans relative">
      
      {/* Botão de Acesso Admin (Discreto no topo) */}
      <div className="absolute top-4 right-4 z-[60]">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setView(view === 'chat' ? 'admin' : 'chat')}
          className="bg-primary/10 hover:bg-primary/20 text-primary border-none rounded-full h-11 w-11"
          title={view === 'chat' ? "Administração" : "Sair do Admin"}
        >
          <Settings size={20} />
        </Button>
      </div>

      {view === 'chat' ? (
        <>
          <Header />
          <main className="flex-1 relative flex flex-col overflow-hidden max-w-5xl mx-auto w-full shadow-xl bg-white border-x border-slate-200/50">
            <ChatInterface />
          </main>
        </>
      ) : (
        <AdminDashboard onBack={() => setView('chat')} />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
};

export default App;

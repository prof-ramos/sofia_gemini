import React from 'react';
import { SUGGESTED_QUESTIONS } from '../constants';
import { Shield, ArrowRight, MessageSquare, Award, Plane, Briefcase, Newspaper } from 'lucide-react';
import { Button } from './ui/Button';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const getIcon = (index: number) => {
    switch (index) {
      case 0: return <Award size={24} className="text-accent group-hover:text-white transition-colors" />;
      case 1: return <Plane size={24} className="text-accent group-hover:text-white transition-colors" />;
      case 2: return <Briefcase size={24} className="text-accent group-hover:text-white transition-colors" />;
      case 3: return <Newspaper size={24} className="text-accent group-hover:text-white transition-colors" />;
      default: return <MessageSquare size={24} className="text-accent group-hover:text-white transition-colors" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 md:p-8 text-center bg-gradient-to-b from-white to-neutral/50 relative overflow-hidden overflow-y-auto scrollbar-thin">
      
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#040920 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-5xl w-full my-auto py-6 md:py-10">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-2xl flex items-center justify-center shadow-xl mb-6 md:mb-8 border-b-4 border-accent shrink-0 ring-4 ring-white/80">
          <Shield className="w-10 h-10 md:w-12 md:h-12 text-accent" />
        </div>
        
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-3 md:mb-4 tracking-tight">
          Sofia
        </h1>
        <div className="h-1 w-12 md:w-16 bg-accent mb-6 md:mb-8 rounded-full"></div>
        
        <p className="text-slate-600 max-w-lg mb-10 md:mb-14 text-base md:text-lg font-light leading-relaxed px-4">
          Assistente Virtual da <strong className="font-semibold text-primary">Associação Nacional dos Oficiais de Chancelaria</strong>. 
          <span className="block mt-2 sm:inline sm:mt-0"> Estou à disposição para auxiliar com legislação, remoções e benefícios.</span>
        </p>

        <div className="w-full max-w-4xl mb-12">
          <div className="flex items-center justify-center gap-3 mb-6 opacity-80">
            <div className="h-px w-8 bg-slate-300"></div>
            <div className="flex items-center gap-2">
               <MessageSquare size={14} className="text-slate-500" />
               <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Como posso ajudar?</h2>
            </div>
            <div className="h-px w-8 bg-slate-300"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 md:px-0">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <Button 
                key={idx} 
                onClick={onStart} 
                variant="unstyled"
                size="none"
                className="
                  group relative flex items-center p-5
                  bg-white rounded-xl border border-slate-200 shadow-sm
                  transition-all duration-300 ease-out
                  hover:shadow-lg hover:border-accent/60 hover:-translate-y-1
                  text-left w-full h-full min-h-[80px]
                "
              >
                <div className="shrink-0 mr-5 p-3 bg-neutral rounded-lg group-hover:bg-accent transition-colors duration-300 shadow-inner">
                  {getIcon(idx)}
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <span className="text-[15px] md:text-base text-slate-700 font-semibold group-hover:text-primary transition-colors leading-snug block">
                    {q}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent group-hover:bg-slate-50 transition-colors opacity-0 group-hover:opacity-100 absolute right-4">
                  <ArrowRight size={18} className="text-accent" />
                </div>
              </Button>
            ))}
          </div>
        </div>

        <Button 
          onClick={onStart}
          variant="primary"
          size="lg"
          className="px-10 py-4 shadow-xl shadow-primary/20"
        >
          <span>Iniciar Atendimento</span>
          <ArrowRight size={18} className="ml-3 text-accent group-hover:translate-x-1 transition-transform" />
        </Button>
        
        <p className="mt-8 text-[10px] text-slate-400 opacity-70 uppercase tracking-widest">
           v1.1 • ASOF Oficial • Acessibilidade OK
        </p>
      </div>
    </div>
  );
};
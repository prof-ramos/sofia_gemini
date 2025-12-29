import React from 'react';
import { Shield, Info, ExternalLink } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-primary text-white shadow-md z-20 border-b border-primary-light shrink-0">
      <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-light rounded-sm flex items-center justify-center border border-white/10 shadow-sm shrink-0">
             <Shield className="w-4 h-4 md:w-5 md:h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg md:text-xl leading-none tracking-wide text-white">ASOF</h1>
            <p className="text-[10px] text-accent uppercase tracking-[0.2em] font-medium mt-0.5 md:mt-1">Oficiais de Chancelaria</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 md:space-x-6 text-sm">
          <a href="#" className="hidden sm:flex items-center space-x-2 text-slate-300 hover:text-white transition-colors uppercase tracking-widest text-xs font-medium">
            <Info size={14} />
            <span>Sobre</span>
          </a>
          <button className="bg-accent hover:bg-accent-light active:bg-accent-light text-primary px-3 py-2 md:px-5 md:py-2 rounded-sm text-[10px] md:text-xs font-bold uppercase tracking-widest transition-transform md:hover:scale-105 active:scale-95 flex items-center space-x-2 shadow-sm whitespace-nowrap">
            <span>Área do Associado</span>
            <ExternalLink size={12} className="hidden xs:block" />
          </button>
        </div>
      </div>
    </header>
  );
};
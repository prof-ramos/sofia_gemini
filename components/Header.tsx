import React from 'react';
import { Shield, Info, ExternalLink, Menu } from 'lucide-react';
import { Button } from './ui/Button';

export const Header: React.FC = () => {
  return (
    <header className="bg-primary text-white shadow-md z-20 border-b border-primary-light shrink-0">
      <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3 md:space-x-4 group cursor-pointer" aria-label="Home ASOF">
          <div className="w-8 h-8 md:w-11 md:h-11 bg-primary-light rounded-sm flex items-center justify-center border border-white/10 shadow-lg shrink-0 transition-transform group-hover:scale-105">
             <Shield className="w-4 h-4 md:w-6 md:h-6 text-accent" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg md:text-2xl leading-none tracking-tight text-white">ASOF</span>
            <span className="text-[9px] md:text-[10px] text-accent/80 uppercase tracking-[0.25em] font-semibold mt-1">Oficiais de Chancelaria</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 md:space-x-8 text-sm">
          <nav className="hidden lg:flex items-center space-x-6" aria-label="Navegação principal">
            <a href="#" className="flex items-center space-x-2 text-slate-200 hover:text-accent transition-colors uppercase tracking-widest text-[11px] font-semibold">
              <Info size={14} />
              <span>Sobre a ASOF</span>
            </a>
          </nav>

          <Button 
            variant="accent"
            size="sm"
            className="md:px-6 md:py-2.5 md:text-xs"
          >
            <span>Portal do Associado</span>
            <ExternalLink size={13} className="ml-2 hidden xs:block opacity-70" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-white/70 hover:text-white p-1 min-h-0 min-w-0"
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </Button>
        </div>
      </div>
    </header>
  );
};

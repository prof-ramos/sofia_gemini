import React, { useState, useRef, useMemo } from 'react';
import { Message, Role } from '../types';
import { 
  User, Sparkles, AlertCircle, ExternalLink, 
  Share2, Copy, CheckCircle, X, Linkedin, Twitter, Link2 
} from 'lucide-react';
import { Button } from './ui/Button';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const isError = message.isError;
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const messageContentRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      const textToCopy = messageContentRef.current?.innerText || message.text;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const parseInline = (inlineText: string): React.ReactNode[] => {
    const parts = inlineText.split(/(\*\*.*?\*\*|https?:\/\/\S+)/g);
    
    return parts.map((part, i) => {
      if (!part) return null;

      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
      }
      
      if (part.match(/^https?:\/\//)) {
        let url = part;
        let extra = '';
        const punctuation = ['.', ',', '!', '?', ';', ':', ')', ']', '}'];
        while (url.length > 0 && punctuation.includes(url[url.length - 1])) {
          extra = url[url.length - 1] + extra;
          url = url.slice(0, -1);
        }

        return (
          <React.Fragment key={i}>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`
                inline-flex items-center gap-1 font-medium underline underline-offset-4 transition-all duration-200
                ${isUser 
                  ? 'text-accent-light hover:text-white decoration-accent-light/40 hover:decoration-white/60' 
                  : 'text-accent hover:text-primary-light decoration-accent/40 hover:decoration-primary-light/60'}
                break-all
              `}
            >
              {url}
              <ExternalLink size={12} className="shrink-0 opacity-70" />
              <span className="sr-only">(abre em nova aba)</span>
            </a>
            {extra}
          </React.Fragment>
        );
      }
      
      return part;
    });
  };

  const formattedContent = useMemo(() => {
    const lines = message.text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;
    let currentTable: { headers: string[]; rows: string[][] } | null = null;

    const flushList = () => {
      if (currentList) {
        const ListTag = currentList.type;
        elements.push(
          <ListTag key={`list-${elements.length}`} className={`my-4 ml-6 space-y-2 ${currentList.type === 'ul' ? 'list-disc marker:text-accent' : 'list-decimal marker:text-accent font-medium'}`}>
            {currentList.items.map((item, idx) => (
              <li key={idx} className="pl-1 text-inherit leading-relaxed">{item}</li>
            ))}
          </ListTag>
        );
        currentList = null;
      }
    };

    const flushTable = () => {
      if (currentTable) {
        elements.push(
          <div key={`table-${elements.length}`} className="my-5 overflow-x-auto rounded-sm border border-slate-200 shadow-sm bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-sm border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  {currentTable.headers.map((h, idx) => (
                    <th key={idx} className="px-4 py-3 text-left font-bold text-primary uppercase tracking-wider text-[11px] border-x border-slate-200 first:border-l-0 last:border-r-0">
                      {parseInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentTable.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2.5 text-slate-600 border-x border-slate-100 first:border-l-0 last:border-r-0">
                        {parseInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        currentTable = null;
      }
    };

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed.split('|').filter(c => c.trim().length > 0 || trimmed.includes('---')).map(c => c.trim());
        if (trimmed.includes('---')) return;
        if (!currentTable) {
          flushList();
          currentTable = { headers: cells, rows: [] };
        } else {
          currentTable.rows.push(cells);
        }
        return;
      } else {
        flushTable();
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = parseInline(trimmed.substring(2));
        if (currentList && currentList.type === 'ul') {
          currentList.items.push(content);
        } else {
          flushList();
          currentList = { type: 'ul', items: [content] };
        }
        return;
      } 
      
      const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (orderedMatch) {
        const content = parseInline(orderedMatch[2]);
        if (currentList && currentList.type === 'ol') {
          currentList.items.push(content);
        } else {
          flushList();
          currentList = { type: 'ol', items: [content] };
        }
        return;
      }

      flushList();

      if (trimmed === '') {
        elements.push(<div key={`spacer-${elements.length}`} className="h-3" />);
      } else {
        elements.push(
          <p key={`p-${elements.length}`} className="mb-3 last:mb-0 leading-relaxed">
            {parseInline(line)}
          </p>
        );
      }
    });

    flushList();
    flushTable();
    return elements;
  }, [message.text, isUser]);

  return (
    <>
      <div className={`group flex w-full mb-6 md:mb-8 ${isUser ? 'justify-end' : 'justify-start'} fade-in`}>
        <div className={`flex max-w-[95%] sm:max-w-[90%] md:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3 md:gap-4 relative`}>
          
          <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-sm flex items-center justify-center shadow-sm border transition-colors duration-200
            ${isUser ? 'bg-neutral text-slate-600 border-slate-200' : 'bg-primary text-accent border-primary-light'}`}>
            {isUser ? <User size={18} /> : <Sparkles size={18} />}
          </div>

          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0 flex-1 relative`}>
            
            {!isUser && !isError && (
              <div className="absolute -top-3 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out z-10 translate-y-1 group-hover:translate-y-0">
                <Button 
                  onClick={() => setShowShareModal(true)}
                  variant="ghost"
                  size="icon"
                  className="bg-white/90 backdrop-blur-sm border-slate-200 p-2 min-h-[36px] min-w-[36px]"
                  title="Compartilhar"
                >
                  <Share2 size={16} />
                </Button>
                <Button 
                  onClick={handleCopy}
                  variant="ghost"
                  size="icon"
                  className={`bg-white/90 backdrop-blur-sm border-slate-200 p-2 min-h-[36px] min-w-[36px] ${copied ? 'text-green-500 border-green-200 bg-green-50' : ''}`}
                  title="Copiar texto"
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                </Button>
              </div>
            )}

            <div className={`
              px-5 py-3.5 md:px-6 md:py-4 rounded-sm shadow-sm text-base md:text-[15px] leading-relaxed relative border break-words w-full
              ${isUser 
                ? 'bg-primary text-white border-primary-light shadow-primary/10' 
                : isError 
                  ? 'bg-red-50 border-red-200 text-red-800' 
                  : 'bg-white border-slate-200 text-slate-700'
              }
            `}>
              {isError && (
                <div className="flex items-center gap-2 mb-2 text-red-600 font-bold text-[10px] uppercase tracking-widest border-b border-red-100 pb-1">
                  <AlertCircle size={14} />
                  <span>Erro de Conexão</span>
                </div>
              )}
              
              <div ref={messageContentRef} className="markdown-content">
                {formattedContent}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2 px-1">
              <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase opacity-70">
                {message.role === Role.MODEL ? 'Sofia • ASOF' : 'Oficial de Chancelaria'}
              </span>
              <span className="text-[10px] text-slate-300">•</span>
              <span className="text-[10px] text-slate-400 font-medium opacity-60">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm fade-in">
          <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-primary text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Share2 size={18} className="text-accent" />
                <h2 className="font-serif font-bold text-lg tracking-tight">Compartilhar</h2>
              </div>
              <Button 
                onClick={() => setShowShareModal(false)} 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/10 border-none min-h-0 min-w-0 p-1"
                aria-label="Fechar modal"
              >
                <X size={20} />
              </Button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`, '_blank')} 
                  variant="outline"
                  size="none"
                  className="flex flex-col items-center p-4 hover:bg-neutral min-h-[80px]"
                >
                   <Linkedin className="text-[#0077b5] mb-2 group-hover:scale-110 transition-transform" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">LinkedIn</span>
                </Button>
                <Button 
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=Sofia - ASOF&url=${window.location.href}`, '_blank')} 
                  variant="outline"
                  size="none"
                  className="flex flex-col items-center p-4 hover:bg-neutral min-h-[80px]"
                >
                   <Twitter className="text-black mb-2 group-hover:scale-110 transition-transform" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Twitter</span>
                </Button>
                <Button 
                  onClick={handleCopy} 
                  variant="outline"
                  size="none"
                  className="flex flex-col items-center p-4 hover:bg-neutral min-h-[80px]"
                >
                   <Copy className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Copiar</span>
                </Button>
                <Button 
                  onClick={() => {navigator.clipboard.writeText(window.location.href); setShowShareModal(false);}} 
                  variant="outline"
                  size="none"
                  className="flex flex-col items-center p-4 hover:bg-neutral min-h-[80px]"
                >
                   <Link2 className="text-accent mb-2 group-hover:scale-110 transition-transform" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Link</span>
                </Button>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 text-center">
              <Button onClick={() => setShowShareModal(false)} variant="ghost" className="text-[10px] tracking-[0.3em] font-bold">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
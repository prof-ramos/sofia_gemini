import React, { useState } from 'react';
import { Message, Role } from '../types';
import { 
  User, Sparkles, AlertCircle, ExternalLink, 
  Share2, Copy, CheckCircle, X, Linkedin, Twitter, Link2 
} from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const isError = message.isError;
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const shareOptions = [
    {
      name: 'LinkedIn',
      icon: <Linkedin size={18} />,
      color: 'bg-[#0077b5]',
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')
    },
    {
      name: 'X (Twitter)',
      icon: <Twitter size={18} />,
      color: 'bg-black',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message.text.substring(0, 200) + '...')}&url=${encodeURIComponent(window.location.href)}`, '_blank')
    },
    {
      name: 'Copiar Texto',
      icon: <Copy size={18} />,
      color: 'bg-primary',
      action: handleCopy
    },
    {
      name: 'Copiar Link',
      icon: <Link2 size={18} />,
      color: 'bg-accent',
      action: () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link da página copiado!');
      }
    }
  ];

  // Robust renderer for basic Markdown (Bold, Lists, and Tables) + URL Detection
  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;
    let currentTable: { headers: string[]; rows: string[][] } | null = null;

    const flushList = (key: string) => {
      if (currentList) {
        const ListTag = currentList.type;
        elements.push(
          <ListTag key={key} className={`my-3 ml-6 space-y-1 ${currentList.type === 'ul' ? 'list-disc' : 'list-decimal'}`}>
            {currentList.items.map((item, idx) => (
              <li key={idx} className="pl-1">{item}</li>
            ))}
          </ListTag>
        );
        currentList = null;
      }
    };

    const flushTable = (key: string) => {
      if (currentTable) {
        elements.push(
          <div key={key} className="my-4 overflow-x-auto rounded-md border border-slate-200 shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {currentTable.headers.map((h, idx) => (
                    <th key={idx} className="px-4 py-3 text-left font-bold text-primary uppercase tracking-wider">
                      {parseInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {currentTable.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2.5 text-slate-600">
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

    const parseInline = (inlineText: string) => {
      const parts = inlineText.split(/(\*\*.*?\*\*|https?:\/\/[^\s\)]+)/g);
      
      return parts.map((part, i) => {
        if (!part) return null;

        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
        }
        
        if (part.match(/^https?:\/\//)) {
          let url = part;
          let extra = '';
          const punctuation = ['.', ',', '!', '?', ';', ':', ')', ']'];
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
                  inline-flex items-center gap-1 font-medium underline underline-offset-4 transition-all
                  ${isUser 
                    ? 'text-white hover:text-accent-light decoration-white/40' 
                    : 'text-accent hover:text-primary decoration-accent/40 hover:decoration-primary/60'}
                  break-all
                `}
              >
                {url}
                <ExternalLink size={12} className="shrink-0 opacity-60" />
              </a>
              {extra}
            </React.Fragment>
          );
        }
        
        return part;
      });
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      const listKey = `list-${index}`;
      const tableKey = `table-${index}`;

      if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
        const cells = trimmedLine.split('|').filter(c => c.trim().length > 0).map(c => c.trim());
        if (trimmedLine.includes('---')) return;
        if (!currentTable) {
          currentTable = { headers: cells, rows: [] };
        } else {
          currentTable.rows.push(cells);
        }
        flushList(listKey);
        return;
      } else if (currentTable) {
        flushTable(tableKey);
      }

      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        const content = parseInline(trimmedLine.substring(2));
        if (currentList && currentList.type === 'ul') {
          currentList.items.push(content);
        } else {
          flushList(listKey);
          currentList = { type: 'ul', items: [content] };
        }
        return;
      } 
      
      const orderedMatch = trimmedLine.match(/^(\d+)\.\s+(.*)/);
      if (orderedMatch) {
        const content = parseInline(orderedMatch[2]);
        if (currentList && currentList.type === 'ol') {
          currentList.items.push(content);
        } else {
          flushList(listKey);
          currentList = { type: 'ol', items: [content] };
        }
        return;
      }

      flushList(listKey);
      flushTable(tableKey);

      if (trimmedLine === '') {
        elements.push(<div key={index} className="h-2" />);
      } else {
        elements.push(
          <p key={index} className="mb-2 last:mb-0">
            {parseInline(line)}
          </p>
        );
      }
    });

    flushList('final-list');
    flushTable('final-table');
    return elements;
  };

  return (
    <>
      <div className={`group flex w-full mb-6 md:mb-8 ${isUser ? 'justify-end' : 'justify-start'} fade-in`}>
        <div className={`flex max-w-[95%] sm:max-w-[90%] md:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3 md:gap-4 relative`}>
          
          {/* Avatar Container */}
          <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-sm flex items-center justify-center shadow-sm border transition-colors
            ${isUser ? 'bg-neutral text-slate-600 border-slate-200' : 'bg-primary text-accent border-primary-light'}`}>
            {isUser ? <User size={18} /> : <Sparkles size={18} />}
          </div>

          {/* Message Content Container */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0 flex-1 relative`}>
            
            {/* Action Buttons (Bot/Sofia only) */}
            {!isUser && !isError && (
              <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="p-1.5 text-slate-400 hover:text-accent transition-colors duration-200"
                  title="Compartilhar"
                >
                  <Share2 size={18} />
                </button>
                <button 
                  onClick={handleCopy}
                  className={`p-1.5 transition-colors duration-200 ${copied ? 'text-green-500' : 'text-slate-400 hover:text-accent'}`}
                  title="Copiar texto"
                >
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                </button>
              </div>
            )}

            <div className={`
              px-5 py-3.5 md:px-6 md:py-4 rounded-sm shadow-sm text-base md:text-[15px] leading-relaxed relative border break-words w-full
              ${isUser 
                ? 'bg-primary text-white border-primary-light' 
                : isError 
                  ? 'bg-red-50 border-red-200 text-red-800' 
                  : 'bg-white border-slate-200 text-slate-700'
              }
            `}>
              {isError && (
                <div className="flex items-center gap-2 mb-2 text-red-600 font-bold text-[10px] uppercase tracking-widest border-b border-red-100 pb-1">
                  <AlertCircle size={14} />
                  <span>Erro de Processamento</span>
                </div>
              )}
              
              <div className={`markdown-content ${isUser ? 'text-slate-50 font-light' : 'text-slate-700 font-normal'}`}>
                {renderFormattedContent(message.text)}
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm fade-in">
          <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-primary text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 size={18} className="text-accent" />
                <h3 className="font-serif font-bold text-lg">Compartilhar Resposta</h3>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-6 font-light">
                Selecione como deseja compartilhar esta informação oficial da ASOF.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {shareOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={() => {
                      option.action();
                      if (option.name !== 'LinkedIn' && option.name !== 'X (Twitter)') setShowShareModal(false);
                    }}
                    className="flex flex-col items-center justify-center p-4 rounded-md border border-slate-100 hover:border-accent/30 hover:bg-neutral/30 transition-all group"
                  >
                    <div className={`w-10 h-10 ${option.color} text-white rounded-full flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                      {option.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
              <button 
                onClick={() => setShowShareModal(false)}
                className="w-full py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
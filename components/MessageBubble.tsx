import React from 'react';
import { Message, Role } from '../types';
import { User, Sparkles, AlertCircle } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const isError = message.isError;

  // Function to format simple Markdown-like syntax (bolding)
  const formatText = (text: string) => {
    // Split by newlines to handle paragraphs
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
          }
          return <span key={j}>{part}</span>;
        })}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className={`flex w-full mb-6 md:mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[95%] sm:max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3 md:gap-4`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-sm flex items-center justify-center shadow-sm border 
          ${isUser ? 'bg-neutral text-slate-600 border-slate-200' : 'bg-primary text-accent border-primary-light'}`}>
          {isUser ? <User size={16} className="md:w-[18px] md:h-[18px]" /> : <Sparkles size={16} className="md:w-[18px] md:h-[18px]" />}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0`}>
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
              <div className="flex items-center gap-2 mb-2 text-red-600 font-bold text-xs uppercase tracking-widest border-b border-red-100 pb-1">
                <AlertCircle size={14} />
                <span>Erro de Sistema</span>
              </div>
            )}
            
            <div className={`${isUser ? 'text-slate-50 font-light' : 'text-slate-700'}`}>
              {formatText(message.text)}
            </div>
          </div>
          
          {/* Increased font size to text-xs (12px) for WCAG compliance */}
          <span className="text-xs text-slate-400 mt-1.5 px-1 font-medium tracking-wide uppercase opacity-80">
            {message.role === Role.MODEL ? 'Sofia • ASOF' : 'Você'}
          </span>
        </div>
      </div>
    </div>
  );
};
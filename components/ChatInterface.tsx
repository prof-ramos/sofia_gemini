import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Send, RefreshCw, StopCircle, ArrowRight, Sparkles, Award, Plane, Briefcase, Newspaper, MessageSquare } from 'lucide-react';
import { Message, Role } from '../types';
import { MessageBubble } from './MessageBubble';
import { sendMessageStream, resetChat } from '../services/geminiService';
import { SUGGESTED_QUESTIONS, SOFIA_ERROR_MESSAGE } from '../constants';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      text: "Olá! Como posso ajudar você hoje? Se tiver dúvidas sobre a carreira de Oficial de Chancelaria, remoções ou a ASOF, pode perguntar.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stopGenerationRef = useRef(false);

  // Scroll to bottom logic with dynamic behavior
  const scrollToBottom = (behavior: ScrollBehavior) => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useLayoutEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Use 'auto' (instant) scrolling when AI is actively streaming to avoid 
      // visual jitter and keeping the view locked to the newest text.
      // Use 'smooth' for user messages or final AI response.
      const isStreaming = isLoading && lastMessage.role === Role.MODEL;
      const behavior = isStreaming ? 'auto' : 'smooth';
      
      scrollToBottom(behavior);
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const executeSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const newMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
    stopGenerationRef.current = false;

    try {
      const stream = sendMessageStream(text);
      let accumulatedText = '';
      let responseId: string | null = null;

      for await (const chunk of stream) {
        if (stopGenerationRef.current) {
          break;
        }

        accumulatedText += chunk;
        
        if (!responseId) {
          responseId = (Date.now() + 1).toString();
          setMessages(prev => [
            ...prev,
            {
              id: responseId!,
              role: Role.MODEL,
              text: accumulatedText,
              timestamp: new Date()
            }
          ]);
        } else {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === responseId 
                ? { ...msg, text: accumulatedText }
                : msg
            )
          );
        }
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: Role.MODEL,
          text: SOFIA_ERROR_MESSAGE,
          timestamp: new Date(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendClick = () => {
    const text = input.trim();
    if (text) {
      setInput('');
      executeSendMessage(text);
    }
  };

  const handleSuggestionClick = (question: string) => {
    executeSendMessage(question);
  };

  const handleStop = () => {
    stopGenerationRef.current = true;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  const handleReset = () => {
    if (window.confirm("Deseja reiniciar a conversa? O histórico atual será apagado.")) {
      resetChat();
      setMessages([{
        id: Date.now().toString(),
        role: Role.MODEL,
        text: "Conversa reiniciada. Em que mais posso ajudar?",
        timestamp: new Date()
      }]);
    }
  };

  const getIcon = (index: number) => {
    switch (index) {
      case 0: return <Award size={18} className="text-accent group-hover:text-white transition-colors" />;
      case 1: return <Plane size={18} className="text-accent group-hover:text-white transition-colors" />;
      case 2: return <Briefcase size={18} className="text-accent group-hover:text-white transition-colors" />;
      case 3: return <Newspaper size={18} className="text-accent group-hover:text-white transition-colors" />;
      default: return <MessageSquare size={18} className="text-accent group-hover:text-white transition-colors" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-8 scrollbar-thin">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Suggested Questions */}
          {messages.length === 1 && !isLoading && (
            <div className="mt-8 mb-8 fade-in px-1 md:px-0" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
              <div className="flex items-center gap-3 mb-5 px-1 opacity-80">
                <div className="h-px w-6 bg-slate-300"></div>
                <div className="flex items-center gap-2">
                   <Sparkles size={14} className="text-accent" />
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sugestões de Tópicos</span>
                </div>
                <div className="h-px w-6 bg-slate-300"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SUGGESTED_QUESTIONS.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(question)}
                    className="
                      group flex items-center p-3.5 h-full
                      bg-white border border-slate-200 rounded-lg shadow-sm
                      hover:border-accent/50 hover:shadow-md hover:-translate-y-0.5
                      active:scale-[0.99] active:bg-slate-50
                      transition-all duration-200 text-left w-full
                    "
                  >
                    <div className="shrink-0 mr-3 p-2 bg-neutral rounded-md group-hover:bg-accent transition-colors duration-200">
                      {getIcon(idx)}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="text-sm text-slate-700 group-hover:text-primary font-medium leading-tight block">
                        {question}
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-accent opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0 hidden sm:block ml-1" />
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Typing Indicator */}
          {isLoading && messages[messages.length - 1].role === Role.USER && (
            <div className="flex justify-start mb-8 fade-in" role="status" aria-live="polite">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-sm bg-primary border border-primary-light flex items-center justify-center shadow-sm">
                   <div className="flex gap-0.5">
                     <div className="w-1 h-1 bg-accent rounded-full typing-dot"></div>
                     <div className="w-1 h-1 bg-accent rounded-full typing-dot"></div>
                     <div className="w-1 h-1 bg-accent rounded-full typing-dot"></div>
                   </div>
                 </div>
                 <span className="text-[10px] md:text-xs text-slate-400 font-medium tracking-widest uppercase animate-pulse">Sofia digitando...</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-white border-t border-slate-200/60 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] z-10">
        <div className="max-w-3xl mx-auto relative flex items-end gap-2 md:gap-3">
          
          <button 
            onClick={handleReset}
            className="p-3 text-slate-400 active:text-primary active:bg-neutral md:hover:text-primary md:hover:bg-neutral rounded-md transition-colors border border-transparent md:hover:border-slate-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Reiniciar conversa"
            disabled={isLoading}
            aria-label="Reiniciar conversa"
          >
            <RefreshCw size={20} />
          </button>

          <div className="flex-1 relative bg-neutral rounded-md border border-slate-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              className="w-full bg-transparent px-4 py-3 text-base md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none max-h-32 scrollbar-thin rounded-md font-light"
              disabled={isLoading}
            />
          </div>

          <button
            onClick={isLoading ? handleStop : handleSendClick}
            disabled={!isLoading && !input.trim()}
            className={`
              p-3 rounded-md shadow-sm flex items-center justify-center transition-all duration-200 border min-w-[44px] min-h-[44px]
              ${(!isLoading && !input.trim())
                ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed' 
                : isLoading
                  ? 'bg-red-50 text-red-600 border-red-200 active:bg-red-100 md:hover:bg-red-100 shadow-none'
                  : 'bg-accent md:hover:bg-accent-light active:bg-accent-light text-primary border-accent-light active:scale-95 md:hover:scale-105'}
            `}
            aria-label={isLoading ? "Parar resposta" : "Enviar mensagem"}
          >
            {isLoading ? <StopCircle size={20} /> : <Send size={20} className={input.trim() ? 'ml-0.5' : ''} />}
          </button>
        </div>
        <div className="text-center mt-2 md:mt-3 hidden md:block">
           <p className="text-[10px] text-slate-400 tracking-wide">Pressione Enter para enviar</p>
        </div>
      </div>
    </div>
  );
};

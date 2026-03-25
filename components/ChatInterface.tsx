import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, Bot, User, X } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface ChatInterfaceProps {
  lessonContent: string;
  history: ChatMessage[];
  onUpdateHistory: (newHistory: ChatMessage[]) => void;
  onClose: () => void;
  gradeLevel?: 'CM1' | 'CM2';
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ lessonContent, history, onUpdateHistory, onClose, gradeLevel = 'CM2' }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    const newHistory = [...history, userMsg];
    onUpdateHistory(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await getChatResponse(history, input, lessonContent, gradeLevel);
      const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      onUpdateHistory([...newHistory, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { role: 'model', text: "Désolé, je rencontre des difficultés de connexion. Veuillez réessayer.", timestamp: Date.now() };
      onUpdateHistory([...newHistory, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-850">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-amber-50 dark:bg-gray-800 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <Bot size={20} className="text-amber-700 dark:text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Assistant Karongo</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">Expertise {gradeLevel} • Officiel</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-gray-200 p-1">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {history.length === 0 && (
          <div className="text-center py-8 px-4 text-gray-500 dark:text-slate-400 text-sm">
            <p className="mb-2">👋 Bonjour !</p>
            <p>Je suis là pour vous aider à comprendre la leçon, trouver des exercices supplémentaires ou clarifier un point du programme.</p>
          </div>
        )}
        
        {history.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm
              prose prose-sm dark:prose-invert max-w-none break-words
              ${msg.role === 'user' 
                ? 'bg-black text-white rounded-br-none dark:bg-amber-600 prose-p:text-white prose-headings:text-white prose-strong:text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-700'}
            `}>
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    // Override default margins to fit bubble better
                    p: ({node, ...props}) => <p className="my-1 leading-normal" {...props} />,
                    ul: ({node, ...props}) => <ul className="my-1 pl-4 list-disc" {...props} />,
                    ol: ({node, ...props}) => <ol className="my-1 pl-4 list-decimal" {...props} />,
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question..."
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
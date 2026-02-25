import React from 'react';
import { BookOpen, PlusCircle, Trash2, History, Menu, X, Moon, Sun, Sparkles, Zap } from 'lucide-react';
import { Lesson } from '../types';

interface SidebarProps {
  lessons: Lesson[];
  currentLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  onNewLesson: () => void;
  onDeleteLesson: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onOpenPremium: () => void;
  remainingTokens: number; // Nouvelle prop
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  lessons, 
  currentLessonId, 
  onSelectLesson, 
  onNewLesson,
  onDeleteLesson,
  isOpen,
  setIsOpen,
  isDarkMode,
  toggleDarkMode,
  onOpenPremium,
  remainingTokens
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content - Z-Index 40 to stay above sticky headers (z-30) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
        flex flex-col
        no-print
      `}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col items-center bg-gray-50 dark:bg-gray-900">
          {/* LOGO AREA */}
          <div className="mb-3">
             <img 
               src="logo.png" 
               alt="Karongo Logo" 
               className="h-20 w-auto object-contain drop-shadow-sm"
               onError={(e) => {
                 // Fallback if image not found
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.parentElement!.innerHTML = '<div class="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-700"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg></div>';
               }}
             />
          </div>
          
          <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-500">
            <h1 className="text-2xl font-bold tracking-tight font-serif">KARONGO</h1>
          </div>
          
          <button onClick={() => setIsOpen(false)} className="lg:hidden absolute top-4 right-4 text-gray-500 dark:text-gray-400">
            <X size={24} />
          </button>
        </div>

        {/* Action Area + Token Counter */}
        <div className="p-4 space-y-3">
            
          {/* Jauge de Jetons Visuelle */}
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg p-3 mb-2">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-500 uppercase tracking-wide">
                    Crédits du jour
                </span>
                <span className={`text-xs font-bold ${remainingTokens === 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                    {remainingTokens}/5
                </span>
            </div>
            <div className="flex space-x-1.5">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                            i < remainingTokens
                                ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]'
                                : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                    />
                ))}
            </div>
          </div>

          <button 
            onClick={() => {
              if (remainingTokens > 0) {
                  onNewLesson();
                  if (window.innerWidth < 1024) setIsOpen(false);
              }
            }}
            disabled={remainingTokens === 0}
            className={`
                w-full flex items-center justify-center space-x-2 p-3 rounded-lg shadow-sm transition-all
                ${remainingTokens > 0 
                    ? 'bg-black dark:bg-amber-600 text-white hover:bg-gray-800 dark:hover:bg-amber-700' 
                    : 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed'}
            `}
          >
            <PlusCircle size={18} />
            <span>Nouvelle Leçon</span>
          </button>

          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDarkMode ? 'Mode Clair' : 'Mode Sombre'}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            <History size={14} />
            <span>Historique</span>
          </div>
          
          {lessons.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8 italic">Aucune leçon sauvegardée.</p>
          ) : (
            <ul className="space-y-2">
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  <button
                    onClick={() => {
                      onSelectLesson(lesson);
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    className={`
                      w-full text-left p-3 rounded-md text-sm transition-all relative group
                      ${currentLessonId === lesson.id 
                        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-400 font-medium ring-1 ring-amber-200 dark:ring-amber-800' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
                    `}
                  >
                    <div className="pr-6 truncate">{lesson.topic}</div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-xs text-gray-400">{lesson.subject}</div>
                      {lesson.difficulty && (
                        <div className="text-[10px] uppercase text-gray-400 font-semibold">{lesson.difficulty}</div>
                      )}
                    </div>
                    
                    <div 
                      onClick={(e) => onDeleteLesson(lesson.id, e)}
                      className="absolute right-2 top-3 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Footer info */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <div className="mt-0 text-xs text-gray-400 text-center">
                Mode Offline-First • CM2 Burkina Faso
            </div>
        </div>
      </aside>
    </>
  );
};
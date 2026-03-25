import React, { useState } from 'react';
import { BookOpen, PlusCircle, Trash2, History, Menu, X, Moon, Sun, Sparkles, Zap, ChevronDown, ChevronRight } from 'lucide-react';
import { Lesson } from '../types';
import { SUBJECT_GROUPS } from '../constants';

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
  onOpenFeedback: () => void;
  remainingTokens: number;
  totalTokens: number;
  activeGradeLevel: 'CM1' | 'CM2';
  setActiveGradeLevel: (level: 'CM1' | 'CM2') => void;
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
  onOpenFeedback,
  remainingTokens,
  totalTokens,
  activeGradeLevel,
  setActiveGradeLevel
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Mathématiques": true,
    "Français": true,
    "Sciences humaines": true,
    "Observations": true,
    "Autres": true
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };
  
  const isCM1 = activeGradeLevel === 'CM1';

  const renderLessonItem = (lesson: Lesson) => (
    <li key={lesson.id}>
      <button
        onClick={() => {
          onSelectLesson(lesson);
          if (window.innerWidth < 1024) setIsOpen(false);
        }}
        className={`
          w-full text-left p-3 rounded-md text-sm transition-all relative group
          ${currentLessonId === lesson.id 
            ? (isCM1 ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-900 dark:text-teal-400 font-medium ring-1 ring-teal-200 dark:ring-teal-800' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-400 font-medium ring-1 ring-amber-200 dark:ring-amber-800') 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
        `}
      >
        <div className="pr-6 truncate">{lesson.topic}</div>
        <div className="flex items-center justify-between mt-1">
          <div className="text-xs text-gray-400 dark:text-slate-400">{lesson.subject}</div>
          {lesson.difficulty && (
            <div className="text-[10px] uppercase text-gray-400 dark:text-slate-400 font-semibold">{lesson.difficulty}</div>
          )}
        </div>
        
        <div 
          onClick={(e) => onDeleteLesson(lesson.id, e)}
          className="absolute right-2 top-3 p-1 text-gray-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Supprimer"
        >
          <Trash2 size={14} />
        </div>
      </button>
    </li>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content - Z-Index 40 to stay above sticky headers (z-30) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
        flex flex-col
        no-print
      `}>
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-slate-700 flex flex-col items-center bg-gray-50 dark:bg-slate-800">
          {/* LOGO AREA */}
          <div className="mb-3">
             <img 
               src="logo.png" 
               alt="Karongo Logo" 
               className="h-20 w-auto object-contain drop-shadow-sm"
               onError={(e) => {
                 // Fallback if image not found
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.parentElement!.innerHTML = `<div class="h-16 w-16 ${isCM1 ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'} rounded-full flex items-center justify-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg></div>`;
               }}
             />
          </div>
          
          <div className={`flex items-center space-x-2 ${isCM1 ? 'text-teal-700 dark:text-teal-500' : 'text-amber-700 dark:text-amber-500'}`}>
            <h1 className="text-2xl font-bold tracking-tight font-serif">KARONGO</h1>
          </div>
          
          <button onClick={() => setIsOpen(false)} className="lg:hidden absolute top-4 right-4 text-gray-500 dark:text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Segmented Control */}
        <div className="px-6 pt-4 pb-2 bg-gray-50 dark:bg-slate-800">
          <div className="flex bg-gray-200 dark:bg-slate-900 rounded-lg p-1 relative">
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md transition-all duration-300 ease-out shadow-sm ${isCM1 ? 'bg-teal-600 left-1' : 'bg-amber-600 left-[calc(50%+2px)]'}`}
            />
            <button
              onClick={() => setActiveGradeLevel('CM1')}
              className={`flex-1 py-1.5 text-sm font-bold z-10 transition-colors ${isCM1 ? 'text-white' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-gray-200'}`}
            >
              CM1
            </button>
            <button
              onClick={() => setActiveGradeLevel('CM2')}
              className={`flex-1 py-1.5 text-sm font-bold z-10 transition-colors ${!isCM1 ? 'text-white' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-gray-200'}`}
            >
              CM2
            </button>
          </div>
        </div>

        {/* Action Area + Token Counter */}
        <div className="p-4 space-y-3">
            
          {/* Jauge de Jetons Visuelle */}
          <div className={`${isCM1 ? 'bg-teal-50 dark:bg-teal-900/10 border-teal-100 dark:border-teal-900/30' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30'} border rounded-lg p-3 mb-2`}>
            <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-semibold ${isCM1 ? 'text-teal-800 dark:text-teal-500' : 'text-amber-800 dark:text-amber-500'} uppercase tracking-wide`}>
                    Crédits du jour
                </span>
                <span className={`text-xs font-bold ${remainingTokens === 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                    {remainingTokens}/{totalTokens}
                </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className={`${isCM1 ? 'bg-teal-500' : 'bg-amber-500'} h-2.5 rounded-full transition-all duration-500`} 
                style={{ width: `${(remainingTokens / totalTokens) * 100}%` }}
              ></div>
            </div>
          </div>

          {totalTokens === 3 && (
              <button 
                onClick={onOpenFeedback}
                className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg border bg-[#fef3c7] border-[#f59e0b] text-amber-900 hover:bg-[#fde68a] dark:bg-[#451a03] dark:border-[#b45309] dark:text-[#fcd34d] dark:hover:bg-[#5c2304] text-xs font-bold transition-colors mb-2"
              >
                <Sparkles size={14} />
                <span>Gagner +2 leçons</span>
              </button>
          )}

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
                    ? (isCM1 ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-[#1c0a00] dark:bg-amber-600 text-white hover:bg-[#2d1100] dark:hover:bg-amber-700') 
                    : 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-slate-400 cursor-not-allowed'}
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

        <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-3">
            <History size={14} />
            <span>Historique {activeGradeLevel}</span>
          </div>
          
          {lessons.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-slate-400 text-center py-8 italic">Aucune leçon sauvegardée.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(SUBJECT_GROUPS).map(([groupName, groupSubjects]) => {
                const groupLessons = lessons.filter(l => groupSubjects.includes(l.subject));
                if (groupLessons.length === 0) return null;
                
                const isExpanded = expandedGroups[groupName];

                return (
                  <div key={groupName} className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-2">
                    <button 
                        onClick={() => toggleGroup(groupName)}
                        className={`w-full flex items-center justify-between py-2 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider transition-colors ${isCM1 ? 'hover:text-teal-600 dark:hover:text-teal-500' : 'hover:text-amber-600 dark:hover:text-amber-500'}`}
                    >
                        <span>{groupName}</span>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    
                    {isExpanded && (
                        <ul className="space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200">
                        {groupLessons.map(renderLessonItem)}
                        </ul>
                    )}
                  </div>
                );
              })}
              
              {/* Fallback for lessons with subjects not in groups */}
              {(() => {
                 const allGroupSubjects = Object.values(SUBJECT_GROUPS).flat();
                 const otherLessons = lessons.filter(l => !allGroupSubjects.includes(l.subject));
                 if (otherLessons.length === 0) return null;
                 
                 const isExpanded = expandedGroups["Autres"];
                 
                 return (
                    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-2">
                        <button 
                            onClick={() => toggleGroup("Autres")}
                            className={`w-full flex items-center justify-between py-2 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider transition-colors ${isCM1 ? 'hover:text-teal-600 dark:hover:text-teal-500' : 'hover:text-amber-600 dark:hover:text-amber-500'}`}
                        >
                            <span>Autres</span>
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        
                        {isExpanded && (
                            <ul className="space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200">
                            {otherLessons.map(renderLessonItem)}
                            </ul>
                        )}
                    </div>
                 )
              })()}
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <div className="mt-0 text-xs text-gray-400 dark:text-slate-400 text-center">
                Mode Offline-First • {activeGradeLevel} Burkina Faso
            </div>
        </div>
      </aside>
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { Subject, GenerationRequest, DifficultyLevel } from '../types';
import { DEFAULT_SUBJECT, DEFAULT_DIFFICULTY, SAMPLE_PROMPTS, SUBJECT_GROUPS } from '../constants';
import { Button } from './Button';
import { Sparkles, ArrowRight, BarChart, ChevronDown, ChevronRight, Lock, Unlock, Star, Gift, CheckCircle2 } from 'lucide-react';
import { checkAccess, getProfile } from '../services/usageService';
import { FeedbackModal } from './FeedbackModal';

interface LessonGeneratorProps {
  onGenerate: (req: GenerationRequest) => void;
  isLoading: boolean;
  activeGradeLevel: 'CM1' | 'CM2';
}

export const LessonGenerator: React.FC<LessonGeneratorProps> = ({ onGenerate, isLoading, activeGradeLevel }) => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState<Subject>(DEFAULT_SUBJECT);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DEFAULT_DIFFICULTY);
  const [context, setContext] = useState('');
  
  // Quota & Feedback State
  const [access, setAccess] = useState(checkAccess());
  const [profile, setProfile] = useState(getProfile());
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

  useEffect(() => {
    const updateState = () => {
      setAccess(checkAccess());
      setProfile(getProfile());
    };
    
    window.addEventListener('profile-updated', updateState);
    return () => window.removeEventListener('profile-updated', updateState);
  }, []);

  const handleUnlock = () => {
      setShowUnlockAnimation(true);
      setTimeout(() => setShowUnlockAnimation(false), 4000);
  };
  
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Mathématiques": true,
    "Français": false,
    "Sciences humaines": false,
    "Observations": false,
    "Autres": false
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    if (!access.allowed) {
        setIsFeedbackOpen(true);
        return;
    }

    onGenerate({ topic, subject, difficulty, additionalContext: context });
  };

  const fillSample = (sample: {topic: string, subject: Subject}) => {
    setTopic(sample.topic);
    setSubject(sample.subject);
  };

  const progress = Math.min(100, (profile.feedbackPoints / 5) * 100);
  const isCM1 = activeGradeLevel === 'CM1';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 relative">
      
      {/* Unlock Animation Overlay */}
      {showUnlockAnimation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className={`bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border-4 ${isCM1 ? 'border-teal-500' : 'border-amber-500'} animate-in zoom-in-50 fade-in duration-500 text-center`}>
                  <div className={`mx-auto w-20 h-20 ${isCM1 ? 'bg-teal-100 text-teal-600' : 'bg-amber-100 text-amber-600'} rounded-full flex items-center justify-center mb-4 animate-bounce`}>
                      <Gift size={40} />
                  </div>
                  <h2 className={`text-3xl font-bold ${isCM1 ? 'text-teal-600' : 'text-amber-600'} mb-2`}>Félicitations !</h2>
                  <p className="text-gray-700 dark:text-gray-300 text-lg">
                      Vous avez débloqué <span className="font-bold">+2 leçons</span> supplémentaires !
                  </p>
              </div>
          </div>
      )}

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
        onUnlock={handleUnlock}
      />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-serif">Préparer une leçon</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Entrez le sujet de votre leçon de {activeGradeLevel}. KARONGO générera une fiche complète avec des exemples du Burkina Faso.
        </p>
      </div>

      {/* Quota Dashboard */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 relative overflow-hidden">
        {profile.bonusUnlocked && (
            <div className={`absolute top-0 right-0 ${isCM1 ? 'bg-teal-500' : 'bg-amber-500'} text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg`}>
                BONUS ACTIF
            </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-1">
                    {profile.bonusUnlocked ? <Unlock size={18} className="text-green-500"/> : <Lock size={18} className="text-gray-400"/>}
                    Quota Journalier
                </span>
                <p className="text-xs text-gray-500">Générations restantes pour aujourd'hui</p>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-700">
                <span className={`text-xl font-black ${access.remaining === 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                    {access.remaining}
                </span>
                <span className="text-sm text-gray-400 font-medium">/ {access.total}</span>
            </div>
        </div>
        
        {/* Feedback Progress */}
        {!profile.bonusUnlocked ? (
            <div className="mt-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <Star size={14} className={`${isCM1 ? 'text-teal-500 fill-teal-500' : 'text-amber-500 fill-amber-500'}`}/>
                        Points Feedback: <span className={`${isCM1 ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'}`}>{profile.feedbackPoints}/5</span>
                    </span>
                    <button onClick={() => setIsFeedbackOpen(true)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
                        Comment gagner des points ? <ChevronRight size={12} />
                    </button>
                </div>
                <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className={`h-full ${isCM1 ? 'bg-gradient-to-r from-teal-400 to-emerald-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]' : 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'} transition-all duration-500 ease-out`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                    <Gift size={12} /> Atteignez 5 points pour débloquer <span className="font-bold text-gray-600 dark:text-gray-300">+2 générations</span> aujourd'hui !
                </p>
            </div>
        ) : (
            <div className="mt-2 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
                <p className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                    <CheckCircle2 size={14} /> Vous avez débloqué le bonus journalier ! Profitez-en.
                </p>
            </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Matière
            </label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.entries(SUBJECT_GROUPS).map(([groupName, subjects]) => {
                const isExpanded = expandedGroups[groupName];
                return (
                  <div key={groupName} className="border rounded-lg border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleGroup(groupName)}
                      className="w-full px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span>{groupName}</span>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    
                    {isExpanded && (
                      <div className="p-2 space-y-1 bg-white dark:bg-gray-800">
                        {subjects.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSubject(s)}
                            className={`
                              w-full py-2 px-3 text-sm font-medium rounded-md text-left transition-all flex items-center justify-between
                              ${subject === s 
                                ? (isCM1 ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-900 dark:text-teal-400 ring-1 ring-teal-500' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-400 ring-1 ring-amber-500') 
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}
                            `}
                          >
                            {s}
                            {subject === s && <div className={`w-2 h-2 rounded-full ${isCM1 ? 'bg-teal-500' : 'bg-amber-500'}`}></div>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
             <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Niveau de difficulté
            </label>
            <div className="space-y-2">
              {Object.values(DifficultyLevel).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`
                    w-full py-2 px-3 text-sm font-medium rounded-lg border text-left transition-all flex items-center justify-between
                    ${difficulty === d
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-900 dark:text-blue-400 ring-1 ring-blue-500' 
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}
                  `}
                >
                  <span className="flex items-center">
                    <BarChart size={14} className="mr-2 opacity-70" />
                    {d}
                  </span>
                  {difficulty === d && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Sujet de la leçon
          </label>
          <input
            type="text"
            id="topic"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: Le périmètre du carré, La règle de trois..."
            className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 ${isCM1 ? 'focus:ring-teal-500 focus:border-teal-500' : 'focus:ring-amber-500 focus:border-amber-500'} transition-shadow outline-none`}
          />
        </div>

        <div>
          <label htmlFor="context" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Contexte (Optionnel)
          </label>
          <textarea
            id="context"
            rows={2}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Ex: Insister sur les conversions, utiliser le contexte du marché..."
            className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 ${isCM1 ? 'focus:ring-teal-500 focus:border-teal-500' : 'focus:ring-amber-500 focus:border-amber-500'} transition-shadow outline-none resize-none`}
          />
        </div>

        <Button 
          type="submit" 
          isLoading={isLoading} 
          className={`w-full py-4 text-lg bg-gray-900 hover:bg-black ${isCM1 ? 'dark:bg-teal-600 dark:hover:bg-teal-700' : 'dark:bg-amber-600 dark:hover:bg-amber-700'}`}
          icon={<Sparkles size={20} />}
        >
          {isLoading ? 'Génération en cours...' : 'Générer la leçon'}
        </Button>
      </form>

      <div className="mt-8">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-3">Suggestions rapides</p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => fillSample(sample)}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {sample.topic}
              <ArrowRight size={10} className="ml-1 opacity-50" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

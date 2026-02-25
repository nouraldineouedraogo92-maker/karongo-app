import React, { useState, useEffect } from 'react';
import { generateLesson } from './services/geminiService';
import { Lesson, GenerationRequest, LoadingState, Subject } from './types';
import { Sidebar } from './components/Sidebar';
import { LessonGenerator } from './components/LessonGenerator';
import { LessonView } from './components/LessonView';
import { SubscriptionModal } from './components/SubscriptionModal';
import { LimitReachedModal } from './components/LimitReachedModal'; 
import { OnboardingModal } from './components/OnboardingModal'; // Import Onboarding
import { LandingPage } from './components/LandingPage';
import { Menu, Ticket } from 'lucide-react';

const STORAGE_KEY = 'karongo_lessons';
const THEME_KEY = 'karongo_theme';
const AUTH_KEY = 'karongo_auth_session';
const USAGE_KEY = 'karongo_daily_usage';

const MAX_DAILY_GENERATIONS = 5;

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // App States
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Modal States
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  // Token / Usage State
  const [tokensUsed, setTokensUsed] = useState(0);
  const [showTokenToast, setShowTokenToast] = useState(false);

  // Calcul dynamique des jetons restants
  const remainingTokens = Math.max(0, MAX_DAILY_GENERATIONS - tokensUsed);

  // Check Authentication on Mount
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem(AUTH_KEY);
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    sessionStorage.setItem(AUTH_KEY, 'true');
    setIsAuthenticated(true);
  };

  // Manage Daily Limits & Toast
  useEffect(() => {
    if (isAuthenticated) {
        const today = new Date().toDateString(); // Format "Fri Feb 14 2025" - unique par jour
        const usageData = localStorage.getItem(USAGE_KEY);
        
        let currentUsage = 0;

        if (usageData) {
            const parsed = JSON.parse(usageData);
            if (parsed.date === today) {
                currentUsage = parsed.count;
            } else {
                // Nouveau jour, reset
                localStorage.setItem(USAGE_KEY, JSON.stringify({ date: today, count: 0 }));
            }
        } else {
            // Première utilisation
            localStorage.setItem(USAGE_KEY, JSON.stringify({ date: today, count: 0 }));
        }

        setTokensUsed(currentUsage);

        // Afficher le toast d'information uniquement si on a des jetons et qu'on vient d'arriver
        if (currentUsage < MAX_DAILY_GENERATIONS) {
             setShowTokenToast(true);
             const timer = setTimeout(() => setShowTokenToast(false), 5000);
             return () => clearTimeout(timer);
        }
    }
  }, [isAuthenticated]);

  // Load lessons & Theme
  useEffect(() => {
    const savedLessons = localStorage.getItem(STORAGE_KEY);
    if (savedLessons) {
      try {
        const parsedLessons = JSON.parse(savedLessons);
        const migratedLessons = parsedLessons.map((l: any) => ({
            ...l,
            chatHistory: l.chatHistory || []
        }));
        setLessons(migratedLessons);
      } catch (e) {
        console.error("Failed to parse lessons", e);
      }
    }

    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !savedTheme) {
             setIsDarkMode(true);
             document.documentElement.classList.add('dark');
        }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
  }, [lessons]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      if (newVal) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(THEME_KEY, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(THEME_KEY, 'light');
      }
      return newVal;
    });
  };

  const executeGeneration = async (req: GenerationRequest) => {
    // VÉRIFICATION DE LA LIMITE
    if (tokensUsed >= MAX_DAILY_GENERATIONS) {
        setIsLimitModalOpen(true);
        return;
    }

    setLoading({ isLoading: true });
    try {
      const content = await generateLesson(req);
      
      // Check for Mismatch signal from the AI
      if (content.startsWith("MISMATCH:")) {
          const suggestedSubject = content.replace("MISMATCH:", "").trim();
          
          const userWantsToChange = window.confirm(
              `Karongo a remarqué que le sujet "${req.topic}" semble relever de la matière : ${suggestedSubject}.\n\nVoulez-vous changer la matière pour ${suggestedSubject} ?\n(Annuler pour forcer la génération en ${req.subject})`
          );

          if (userWantsToChange) {
              let newSubject = req.subject;
              Object.values(Subject).forEach(val => {
                  if ((val as string).toLowerCase() === suggestedSubject.toLowerCase()) {
                      newSubject = val as Subject;
                  }
              });
              
              if (newSubject !== req.subject) {
                  await executeGeneration({ ...req, subject: newSubject });
                  return;
              } else {
                   await executeGeneration({ ...req, force: true });
                   return;
              }
          } else {
              await executeGeneration({ ...req, force: true });
              return;
          }
      }

      const newLesson: Lesson = {
        id: crypto.randomUUID(),
        topic: req.topic,
        subject: req.subject,
        difficulty: req.difficulty,
        content: content,
        chatHistory: [], // Initialize empty chat history
        createdAt: Date.now(),
      };

      setLessons(prev => [newLesson, ...prev]);
      setCurrentLessonId(newLesson.id);

      // INCREMENTER LE COMPTEUR SUR SUCCÈS
      const newCount = tokensUsed + 1;
      setTokensUsed(newCount);
      const today = new Date().toDateString();
      localStorage.setItem(USAGE_KEY, JSON.stringify({ date: today, count: newCount }));

    } catch (error: any) {
      alert(error.message || "Une erreur est survenue");
    } finally {
      setLoading({ isLoading: false });
    }
  };

  const handleGenerate = (req: GenerationRequest) => {
      executeGeneration(req);
  };

  const handleUpdateLesson = (updatedLesson: Lesson) => {
    setLessons(prev => prev.map(l => l.id === updatedLesson.id ? updatedLesson : l));
  };

  const handleDeleteLesson = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Voulez-vous vraiment supprimer cette leçon ?")) {
        setLessons(prev => prev.filter(l => l.id !== id));
        if (currentLessonId === id) {
            setCurrentLessonId(null);
        }
    }
  };

  // IF NOT AUTHENTICATED, SHOW LANDING PAGE
  if (!isAuthenticated) {
    return <LandingPage onLoginSuccess={handleLoginSuccess} />;
  }

  // ELSE SHOW APP
  const currentLesson = lessons.find(l => l.id === currentLessonId);

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors`}>
      <Sidebar 
        lessons={lessons} 
        currentLessonId={currentLessonId}
        onSelectLesson={(l) => setCurrentLessonId(l.id)}
        onNewLesson={() => setCurrentLessonId(null)}
        onDeleteLesson={handleDeleteLesson}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onOpenPremium={() => setIsSubscriptionOpen(true)}
        remainingTokens={remainingTokens}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between shadow-sm z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-700 dark:text-gray-300">
            <Menu size={24} />
          </button>
          
          <span className="font-bold text-amber-700 dark:text-amber-500">KARONGO</span>
          
          {/* Mobile Token Counter */}
          <div className="flex items-center space-x-2">
             <div className="flex items-center bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-full border border-amber-100 dark:border-amber-800">
                <Ticket size={14} className="text-amber-600 dark:text-amber-500 mr-1.5" />
                <span className={`text-xs font-bold ${remainingTokens === 0 ? 'text-red-500' : 'text-amber-800 dark:text-amber-400'}`}>
                    {remainingTokens}
                </span>
             </div>
          </div>
        </div>
        
        {/* TOKEN USAGE TOAST (Initial Notification) */}
        {showTokenToast && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-500 w-[90%] max-w-sm pointer-events-none">
                <div className="bg-white dark:bg-gray-800 border-l-4 border-amber-500 shadow-xl rounded-r-lg p-4 flex items-center pointer-events-auto">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full mr-3 text-amber-600 dark:text-amber-400">
                        <Ticket size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Il vous reste <span className="font-bold text-amber-600 dark:text-amber-400">{remainingTokens}</span> jetons aujourd'hui.
                        </p>
                    </div>
                </div>
            </div>
        )}

        <main className="flex-1 overflow-hidden bg-gray-50/50 dark:bg-gray-900/50 relative">
          {currentLesson ? (
            <LessonView 
                lesson={currentLesson} 
                onUpdateLesson={handleUpdateLesson} 
            />
          ) : (
            <div className="h-full overflow-y-auto">
                <LessonGenerator 
                    onGenerate={handleGenerate} 
                    isLoading={loading.isLoading} 
                />
            </div>
          )}
        </main>
      </div>

      {/* Onboarding Modal (s'affiche uniquement si non vu) */}
      <OnboardingModal />

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={isSubscriptionOpen} 
        onClose={() => setIsSubscriptionOpen(false)} 
      />

      {/* Limit Reached Modal */}
      <LimitReachedModal 
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
      />
    </div>
  );
};

export default App;
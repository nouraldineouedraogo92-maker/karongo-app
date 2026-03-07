import React, { useState, useEffect } from 'react';
import { generateLesson } from './services/geminiService';
import { Lesson, GenerationRequest, LoadingState, Subject } from './types';
import { Sidebar } from './components/Sidebar';
import { LessonGenerator } from './components/LessonGenerator';
import { LessonView } from './components/LessonView';
import { SubscriptionModal } from './components/SubscriptionModal';
import { LimitReachedModal } from './components/LimitReachedModal'; 
import { FeedbackModal } from './components/FeedbackModal';
import { OnboardingModal } from './components/OnboardingModal'; // Import Onboarding
import { Menu, Ticket } from 'lucide-react';
import { checkAccess, incrementUsage, getProfile } from './services/usageService';

const STORAGE_KEY = 'karongo_lessons';
const THEME_KEY = 'karongo_theme';

const App: React.FC = () => {
  // App States
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Modal States
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Usage State
  const [access, setAccess] = useState(checkAccess());

  // Listen for usage updates
  useEffect(() => {
    const updateUsage = () => {
        setAccess(checkAccess());
    };
    window.addEventListener('profile-updated', updateUsage);
    return () => window.removeEventListener('profile-updated', updateUsage);
  }, []);

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
    if (!access.allowed) {
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
      incrementUsage();

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
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        remainingTokens={access.remaining}
        totalTokens={access.total}
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
                <span className={`text-xs font-bold ${access.remaining === 0 ? 'text-red-500' : 'text-amber-800 dark:text-amber-400'}`}>
                    {access.remaining}
                </span>
             </div>
          </div>
        </div>
        
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
        onOpenFeedback={() => {
            setIsLimitModalOpen(false);
            setIsFeedbackModalOpen(true);
        }}
        isBonusUnlocked={access.total > 3}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onUnlock={() => {
            // Refresh access state is handled by event listener
            // Just close modal or show success
            // FeedbackModal handles its own success message then calls onClose
        }}
      />
    </div>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { generateLesson } from './services/geminiService';
import { Lesson, GenerationRequest, LoadingState, Subject } from './types';
import { Sidebar } from './components/Sidebar';
import { LessonGenerator } from './components/LessonGenerator';
import { LessonView } from './components/LessonView';
import { SubscriptionModal } from './components/SubscriptionModal';
import { LimitReachedModal } from './components/LimitReachedModal'; 
import { FeedbackModal } from './components/FeedbackModal';
import { OnboardingModal } from './components/OnboardingModal';
import { LandingPage } from './components/Auth/LandingPage';
import { ProfileModal } from './components/Auth/ProfileModal';
import { Menu, Ticket, LogOut } from 'lucide-react';
import { checkAccess, getProfile, syncProfileWithSupabase } from './services/usageService';

const STORAGE_KEY = 'karongo_lessons';
const THEME_KEY = 'karongo_theme';

const App: React.FC = () => {
  // Auth States
  const [session, setSession] = useState<any>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  // App States
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeGradeLevel, setActiveGradeLevel] = useState<'CM1' | 'CM2'>('CM2');
  
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

  // Auth & Profile Check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkProfileCompletion(session);
      else setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkProfileCompletion(session);
      else setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkProfileCompletion = async (currentSession: any) => {
    try {
      const userId = currentSession.user.id;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it automatically
        const newProfile = {
          id: userId,
          full_name: currentSession.user.user_metadata?.full_name || '',
          grade_level: 'CM2',
          points_balance: 0,
          daily_lessons_count: 0,
          last_active_date: new Date().toISOString().split('T')[0]
        };
        
        await supabase.from('profiles').insert([newProfile]);
        syncProfileWithSupabase(newProfile);
        setIsProfileComplete(!!newProfile.full_name);
        setActiveGradeLevel('CM2');
      } else if (data) {
        // Check for daily reset
        const today = new Date().toISOString().split('T')[0];
        if (data.last_active_date !== today) {
            data.daily_lessons_count = 0;
            data.last_active_date = today;
            await supabase.from('profiles').update({
                daily_lessons_count: 0,
                last_active_date: today
            }).eq('id', userId);
        }

        syncProfileWithSupabase(data);
        setIsProfileComplete(!!data.full_name);
        if (data.grade_level === 'CM1' || data.grade_level === 'CM2') {
            setActiveGradeLevel(data.grade_level);
        }
      }
    } catch (err) {
      console.error("Error checking profile:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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
    const profile = getProfile();
    const isQuotaReached = profile.daily_lessons_count >= 3;
    const hasPoints = profile.points_balance > 0;

    // VÉRIFICATION DE LA LIMITE
    if (isQuotaReached && !hasPoints) {
        setIsLimitModalOpen(true);
        return;
    }

    setLoading({ isLoading: true });
    try {
      const content = await generateLesson({ ...req, gradeLevel: activeGradeLevel });
      
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
                  await executeGeneration({ ...req, subject: newSubject, gradeLevel: activeGradeLevel });
                  return;
              } else {
                   await executeGeneration({ ...req, force: true, gradeLevel: activeGradeLevel });
                   return;
              }
          } else {
              await executeGeneration({ ...req, force: true, gradeLevel: activeGradeLevel });
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
        gradeLevel: activeGradeLevel
      };

      setLessons(prev => [newLesson, ...prev]);
      setCurrentLessonId(newLesson.id);

      // INCREMENTER LE COMPTEUR SUR SUCCÈS
      const newCount = profile.daily_lessons_count + 1;
      let newPoints = profile.points_balance;

      if (isQuotaReached && hasPoints) {
          newPoints -= 1; // Deduct a point for the extra lesson
      }

      const updatedProfile = {
          ...profile,
          daily_lessons_count: newCount,
          points_balance: newPoints
      };
      
      if (profile.id) {
          await supabase.from('profiles').update({
              daily_lessons_count: newCount,
              points_balance: newPoints
          }).eq('id', profile.id);
      }

      syncProfileWithSupabase(updatedProfile);

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <LandingPage onLoginSuccess={() => {}} />
      </>
    );
  }

  const filteredLessons = lessons.filter(l => (l.gradeLevel || 'CM2') === activeGradeLevel);
  const currentLesson = filteredLessons.find(l => l.id === currentLessonId);
  const profile = getProfile();

  const themeClass = activeGradeLevel === 'CM1' ? 'theme-cm1' : 'theme-cm2';

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors ${themeClass}`}>
      <ProfileModal 
        isOpen={!isProfileComplete} 
        userId={session.user.id} 
        onComplete={() => checkProfileCompletion(session)} 
      />
      
      <Sidebar 
        lessons={filteredLessons} 
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
        activeGradeLevel={activeGradeLevel}
        setActiveGradeLevel={setActiveGradeLevel}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Desktop Header / Status Bar */}
        <div className="hidden lg:flex bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 items-center justify-between shadow-sm z-10">
          <div className="flex items-center space-x-4">
            <span className={`font-bold text-xl ${activeGradeLevel === 'CM1' ? 'text-teal-700 dark:text-teal-500' : 'text-amber-700 dark:text-amber-500'}`}>KARONGO</span>
            
            {/* Grade Level Switch */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 relative w-32">
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md transition-all duration-300 ease-out shadow-sm ${activeGradeLevel === 'CM1' ? 'bg-teal-600 left-1' : 'bg-amber-600 left-[calc(50%+2px)]'}`}
              />
              <button
                onClick={() => setActiveGradeLevel('CM1')}
                className={`flex-1 py-1 text-xs font-bold z-10 transition-colors ${activeGradeLevel === 'CM1' ? 'text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                CM1
              </button>
              <button
                onClick={() => setActiveGradeLevel('CM2')}
                className={`flex-1 py-1 text-xs font-bold z-10 transition-colors ${activeGradeLevel === 'CM2' ? 'text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                CM2
              </button>
            </div>

            {profile.full_name && (
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                Bonjour {profile.full_name} | Quota: {access.remaining}/{access.total} | Points: {profile.points_balance}
              </span>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <LogOut size={16} className="mr-2" />
            Déconnexion
          </button>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between shadow-sm z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-700 dark:text-gray-300">
            <Menu size={24} />
          </button>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`font-bold text-sm ${activeGradeLevel === 'CM1' ? 'text-teal-700 dark:text-teal-500' : 'text-amber-700 dark:text-amber-500'}`}>KARONGO</span>
              
              {/* Grade Level Switch Mobile */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 relative w-24">
                <div 
                  className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-md transition-all duration-300 ease-out shadow-sm ${activeGradeLevel === 'CM1' ? 'bg-teal-600 left-0.5' : 'bg-amber-600 left-[calc(50%+1px)]'}`}
                />
                <button
                  onClick={() => setActiveGradeLevel('CM1')}
                  className={`flex-1 py-0.5 text-[10px] font-bold z-10 transition-colors ${activeGradeLevel === 'CM1' ? 'text-white' : 'text-gray-500'}`}
                >
                  CM1
                </button>
                <button
                  onClick={() => setActiveGradeLevel('CM2')}
                  className={`flex-1 py-0.5 text-[10px] font-bold z-10 transition-colors ${activeGradeLevel === 'CM2' ? 'text-white' : 'text-gray-500'}`}
                >
                  CM2
                </button>
              </div>
            </div>

            {profile.full_name && (
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {access.remaining}/{access.total} leçons | {profile.points_balance} pts
              </span>
            )}
          </div>
          
          {/* Mobile Token Counter */}
          <div className="flex items-center space-x-2">
             <div className={`flex items-center px-2 py-1 rounded-full border ${activeGradeLevel === 'CM1' ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-100 dark:border-teal-800' : 'bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-800'}`}>
                <Ticket size={12} className={`${activeGradeLevel === 'CM1' ? 'text-teal-600 dark:text-teal-500' : 'text-amber-600 dark:text-amber-500'} mr-1`} />
                <span className={`text-[10px] font-bold ${access.remaining === 0 ? 'text-red-500' : (activeGradeLevel === 'CM1' ? 'text-teal-800 dark:text-teal-400' : 'text-amber-800 dark:text-amber-400')}`}>
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
                    activeGradeLevel={activeGradeLevel}
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
        isBonusUnlocked={profile.points_balance > 0}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onUnlock={() => {
            // Refresh access state is handled by event listener
        }}
      />
    </div>
  );
};

export default App;
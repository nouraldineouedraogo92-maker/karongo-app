import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, MapPin, FileDown, ChevronRight, Check } from 'lucide-react';
import { Button } from './Button';

const ONBOARDING_KEY = 'karongo_onboarding_finished';

const STEPS = [
  {
    title: "Bienvenue sur Karongo",
    description: "Votre assistant pédagogique intelligent conçu spécialement pour les classes de CM2 au Burkina Faso.",
    icon: <Sparkles size={48} className="text-amber-600 dark:text-amber-400" />,
    imageBg: "bg-amber-100 dark:bg-amber-900/30"
  },
  {
    title: "Simple & Rapide",
    description: "Générez des fiches de leçons complètes et conformes aux programmes officiels en quelques secondes.",
    icon: <Zap size={48} className="text-amber-600 dark:text-amber-400" />,
    imageBg: "bg-orange-100 dark:bg-orange-900/30"
  },
  {
    title: "100% Localisé",
    description: "Les contenus intègrent automatiquement le contexte culturel et géographique du Burkina Faso (Marchés, Villes, Agriculture).",
    icon: <MapPin size={48} className="text-amber-600 dark:text-amber-400" />,
    imageBg: "bg-yellow-100 dark:bg-yellow-900/30"
  },
  {
    title: "Export & Partage",
    description: "Téléchargez vos leçons en PDF pour les imprimer ou les partager via Bluetooth, même sans connexion internet.",
    icon: <FileDown size={48} className="text-amber-600 dark:text-amber-400" />,
    imageBg: "bg-amber-100 dark:bg-amber-900/30"
  }
];

export const OnboardingModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Vérifier si l'onboarding a déjà été vu
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeenOnboarding) {
      // Petit délai pour l'animation d'entrée
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (isAnimating) return;
    
    if (currentStep < STEPS.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 300); // Durée de la transition de sortie
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col relative min-h-[500px]">
        
        {/* Progress Bar (Top) */}
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700">
          <div 
            className="h-full bg-amber-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center transition-opacity duration-300" style={{ opacity: isAnimating ? 0 : 1 }}>
          
          {/* Icon/Image Circle */}
          <div className={`w-32 h-32 rounded-full ${STEPS[currentStep].imageBg} flex items-center justify-center mb-8 shadow-inner animate-in zoom-in duration-500`}>
            {STEPS[currentStep].icon}
          </div>

          {/* Text */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-serif mb-4">
            {STEPS[currentStep].title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            {STEPS[currentStep].description}
          </p>

        </div>

        {/* Footer Navigation */}
        <div className="p-8 pt-0 mt-auto">
          <div className="flex items-center justify-between mb-6">
             {/* Dots Indicator */}
            <div className="flex space-x-2">
              {STEPS.map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                    idx === currentStep 
                      ? 'bg-amber-600 dark:bg-amber-500 scale-110' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <Button 
            onClick={handleNext}
            className="w-full py-4 text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98]"
            variant="primary"
          >
            {currentStep === STEPS.length - 1 ? (
              <span className="flex items-center justify-center font-bold">
                C'est parti ! <Check size={24} className="ml-2" />
              </span>
            ) : (
              <span className="flex items-center justify-center font-bold">
                Suivant <ChevronRight size={24} className="ml-2" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
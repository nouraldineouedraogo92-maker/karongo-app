import React from 'react';
import { X, Trophy, Clock } from 'lucide-react';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LimitReachedModal: React.FC<LimitReachedModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden scale-100 transform transition-all relative">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-600 dark:text-gray-300 transition-all z-20"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
            <Trophy size={32} className="text-amber-600 dark:text-amber-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-serif mb-4">
            Félicitations pour votre travail aujourd'hui ! 👏
          </h2>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            Vous avez utilisé vos 5 jetons quotidiens. Karongo doit maintenant recharger ses batteries pour économiser les ressources du projet.
          </p>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-center text-amber-800 dark:text-amber-400 font-medium">
            <Clock size={18} className="mr-2" />
            <span>Revenez demain matin pour 5 nouvelles leçons !</span>
          </div>

          <button 
            onClick={onClose}
            className="mt-8 w-full py-3 px-4 bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
          >
            Compris, à demain !
          </button>
        </div>
      </div>
    </div>
  );
};
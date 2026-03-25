import React from 'react';
import { X, Check, Smartphone, ShieldCheck, Zap } from 'lucide-react';
import { Button } from './Button';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto scale-100 transform transition-all relative flex flex-col scrollbar-hide">
        
        {/* Close Button - High Contrast Fix */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all z-20 backdrop-blur-sm shadow-sm"
          title="Fermer"
        >
          <X size={20} />
        </button>

        {/* Header Image/Gradient */}
        <div className="h-32 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 relative">
            {/* Decorative pattern/texture overlay */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-md shadow-inner relative z-10">
                <Zap size={40} className="text-white fill-current" />
            </div>
        </div>

        <div className="p-8">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-serif mb-2">Karongo Premium</h2>
                <p className="text-gray-500 dark:text-slate-400">Débloquez la puissance pédagogique illimitée.</p>
            </div>

            {/* Pricing */}
            <div className="flex justify-center items-baseline mb-8">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">2.000</span>
                <span className="text-xl text-gray-500 dark:text-slate-400 ml-2">FCFA / mois</span>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8">
                {[
                    "Génération de leçons illimitée",
                    "Export PDF sans filigrane",
                    "Exercices corrigés détaillés",
                    "Support prioritaire WhatsApp"
                ].map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700 dark:text-gray-300">
                        <div className="mr-3 bg-green-100 dark:bg-green-900/30 text-green-600 p-1 rounded-full shrink-0">
                            <Check size={14} strokeWidth={3} />
                        </div>
                        <span className="text-sm">{feature}</span>
                    </li>
                ))}
            </ul>

            {/* Payment Buttons Placeholder */}
            <div className="space-y-3">
                <p className="text-xs text-center text-gray-400 dark:text-slate-400 uppercase font-semibold mb-2">Moyens de paiement acceptés</p>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => alert("L'intégration Orange Money sera disponible prochainement.")}
                        className="flex items-center justify-center py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors group"
                    >
                        <div className="w-4 h-4 rounded-full bg-orange-500 mr-2 group-hover:scale-110 transition-transform shadow-sm"></div>
                        <span className="font-bold text-gray-700 dark:text-gray-200 text-xs sm:text-sm">Orange Money</span>
                    </button>
                    <button 
                        onClick={() => alert("L'intégration Moov Money sera disponible prochainement.")}
                        className="flex items-center justify-center py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group"
                    >
                        <div className="w-4 h-4 rounded-full bg-blue-600 mr-2 group-hover:scale-110 transition-transform shadow-sm"></div>
                        <span className="font-bold text-gray-700 dark:text-gray-200 text-xs sm:text-sm">Moov Money</span>
                    </button>
                </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-400 dark:text-slate-400 flex items-center justify-center">
                <ShieldCheck size={12} className="mr-1" />
                Paiement sécurisé & crypté
            </p>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface LandingPageProps {
  onLoginSuccess: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Simulation d'un petit délai pour l'effet "sécurité"
    setTimeout(() => {
      // MOT DE PASSE DÉFINI ICI
      if (password === 'KARONGO2025') {
        onLoginSuccess();
      } else {
        setError(true);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-300">
        
        {/* Header Visual */}
        <div className="h-32 bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm shadow-inner relative z-10">
            <Lock size={40} className="text-white" />
          </div>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-serif tracking-tight mb-2">
              KARONGO
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Espace réservé aux enseignants testeurs.
              <br />Veuillez vous identifier.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mot de passe d'accès
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  className={`
                    w-full pl-4 pr-10 py-3 rounded-lg border bg-gray-50 dark:bg-gray-900 dark:text-white outline-none transition-all
                    ${error 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500'}
                  `}
                  placeholder="•••••••••••"
                  autoFocus
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {error ? (
                    <AlertCircle size={18} className="text-red-500" />
                  ) : (
                    <ShieldCheck size={18} className="text-gray-400" />
                  )}
                </div>
              </div>
              {error && (
                <p className="mt-2 text-xs text-red-500 flex items-center animate-pulse">
                  Mot de passe incorrect. Réessayez.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className={`
                w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium transition-all transform active:scale-[0.98]
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gray-900 hover:bg-black dark:bg-amber-600 dark:hover:bg-amber-700 shadow-lg hover:shadow-xl'}
              `}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Vérification...
                </span>
              ) : (
                <span className="flex items-center">
                  Accéder à l'application <ArrowRight size={18} className="ml-2" />
                </span>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
             <p className="text-[10px] text-gray-400 uppercase tracking-widest">
               Version Beta • Burkina Faso
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { 
  User, School, Settings, FileText, Star, Ticket, 
  Sparkles, HelpCircle, MessageSquare, Bug, LogOut
} from 'lucide-react';

interface UserProfileMenuProps {
  session: any;
  profile: any;
  access: any;
  activeGradeLevel: 'CM1' | 'CM2';
  totalLessons: number;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenSubscription: () => void;
  onOpenFeedback: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  session,
  profile,
  access,
  activeGradeLevel,
  totalLessons,
  onLogout,
  onOpenProfile,
  onOpenSubscription,
  onOpenFeedback
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const avatarUrl = session?.user?.user_metadata?.avatar_url;
  const email = session?.user?.email;
  const isPremium = access.total === Infinity || access.total > 100; // Adjust based on your premium logic
  
  const themeBg = activeGradeLevel === 'CM1' ? 'bg-teal-600' : 'bg-amber-600';

  return (
    <div className="relative flex items-center space-x-3" ref={menuRef}>
      {/* Badges (Desktop only) */}
      <div className="hidden md:flex items-center space-x-2">
        <div className="flex items-center px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
          <Star size={14} className="text-amber-500 mr-1.5 fill-amber-500" />
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{profile.points_balance} pts</span>
        </div>
        <div className="flex items-center px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
          <Ticket size={14} className="text-green-600 mr-1.5" />
          <span className="text-xs font-bold text-green-700 dark:text-green-400">{access.remaining}/{access.total}</span>
        </div>
      </div>

      {/* Avatar Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center focus:outline-none"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" />
        ) : (
          <div className={`w-10 h-10 rounded-full ${themeBg} flex items-center justify-center text-white font-bold text-lg border-2 border-white dark:border-gray-800 shadow-sm`}>
            {getInitials(profile.full_name)}
          </div>
        )}
        {/* Online Indicator */}
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
      </button>

      {/* Dropdown / Bottom Sheet */}
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className={`
            fixed md:absolute z-50 bg-white dark:bg-gray-800 shadow-xl md:rounded-2xl border border-gray-100 dark:border-gray-700
            transition-transform duration-300 ease-out
            md:top-full md:right-0 md:mt-2 md:w-72 md:transform-none
            bottom-0 left-0 right-0 rounded-t-3xl md:bottom-auto md:left-auto
            ${isOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0 md:opacity-0 md:pointer-events-none'}
          `}>
            {/* Desktop Caret (Arrow) */}
            <div className="hidden md:block absolute -top-2 right-4 w-4 h-4 bg-white dark:bg-gray-800 border-t border-l border-gray-100 dark:border-gray-700 transform rotate-45"></div>

            {/* Mobile Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>

            <div className="p-4 border-b border-gray-100 dark:border-gray-700 relative z-10 bg-white dark:bg-gray-800 md:rounded-t-2xl">
              <div className="flex items-center space-x-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full" />
                ) : (
                  <div className={`w-12 h-12 rounded-full ${themeBg} flex items-center justify-center text-white font-bold text-xl`}>
                    {getInitials(profile.full_name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{profile.full_name}</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full">
                      {isPremium ? 'Pro' : 'Gratuit'}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-slate-400">•</span>
                    <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400">{activeGradeLevel}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-h-[60vh] md:max-h-[70vh] overflow-y-auto pb-safe relative z-10 bg-white dark:bg-gray-800 md:rounded-b-2xl">
              {/* MON COMPTE */}
              <div className="py-2">
                <div className="px-4 py-1 text-[10px] font-bold text-gray-500 dark:text-slate-400 tracking-wider uppercase">Mon compte</div>
                <button onClick={() => { onOpenProfile(); setIsOpen(false); }} className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <User size={18} className="mr-3 text-indigo-500" />
                  Mon profil
                </button>
                <button className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center">
                    <School size={18} className="mr-3 text-blue-400" />
                    Mon école
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full">Nouveau</span>
                </button>
                <button className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <Settings size={18} className="mr-3 text-gray-400 dark:text-slate-400" />
                  Paramètres
                </button>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-700/50 mx-4"></div>

              {/* ACTIVITÉ */}
              <div className="py-2">
                <div className="px-4 py-1 text-[10px] font-bold text-gray-500 dark:text-slate-400 tracking-wider uppercase">Activité</div>
                <div className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                  <div className="flex items-center">
                    <FileText size={18} className="mr-3 text-blue-500" />
                    Mes leçons
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">{totalLessons}</span>
                </div>
                <div className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                  <div className="flex items-center">
                    <Star size={18} className="mr-3 text-amber-500 fill-amber-500" />
                    Mes points
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 rounded-full">{profile.points_balance} pt{profile.points_balance !== 1 ? 's' : ''}</span>
                </div>
                <div className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                  <div className="flex items-center">
                    <Ticket size={18} className="mr-3 text-green-500" />
                    Quota du jour
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-full">{access.remaining}/{access.total}</span>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-700/50 mx-4"></div>

              {/* ABONNEMENT */}
              {!isPremium && (
                <div className="py-3 px-4">
                  <div className="text-[10px] font-bold text-gray-500 dark:text-slate-400 tracking-wider uppercase mb-2">Abonnement</div>
                  <button 
                    onClick={() => { onOpenSubscription(); setIsOpen(false); }}
                    className="w-full flex items-center p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors text-left"
                  >
                    <Sparkles size={20} className="text-amber-500 mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-amber-900 dark:text-amber-400">Passer à Pro</div>
                      <div className="text-xs text-amber-700 dark:text-amber-500">Générations illimitées</div>
                    </div>
                  </button>
                </div>
              )}

              <div className="h-px bg-gray-100 dark:bg-gray-700/50 mx-4"></div>

              {/* AIDE */}
              <div className="py-2">
                <div className="px-4 py-1 text-[10px] font-bold text-gray-500 dark:text-slate-400 tracking-wider uppercase">Aide</div>
                <button className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <HelpCircle size={18} className="mr-3 text-rose-500" />
                  Centre d'aide
                </button>
                <button onClick={() => { onOpenFeedback(); setIsOpen(false); }} className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <MessageSquare size={18} className="mr-3 text-purple-500" />
                  Donner un avis
                </button>
                <button onClick={() => { onOpenFeedback(); setIsOpen(false); }} className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <Bug size={18} className="mr-3 text-emerald-500" />
                  Signaler un bug
                </button>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-700/50 mx-4"></div>

              {/* DÉCONNEXION */}
              <div className="py-2">
                <button 
                  onClick={() => { onLogout(); setIsOpen(false); }}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={18} className="mr-3" />
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, Bug, Upload, CheckCircle2, Trophy } from 'lucide-react';
import { Button } from './Button';
import { addFeedbackPoints, getProfile } from '../services/usageService';
import { FeedbackType } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onUnlock }) => {
  if (!isOpen) return null;

  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [detailedText, setDetailedText] = useState('');
  const [bugText, setBugText] = useState('');
  const [bugFile, setBugFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [quickFeedbackCount, setQuickFeedbackCount] = useState(0);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [isBonusAlreadyUnlocked, setIsBonusAlreadyUnlocked] = useState(false);

  useEffect(() => {
      if (isOpen) {
          const profile = getProfile();
          setQuickFeedbackCount(profile.quickFeedbackCount || 0);
          setCurrentPoints(profile.feedbackPoints || 0);
          setIsBonusAlreadyUnlocked(profile.bonusUnlocked || false);
      }
  }, [isOpen]);

  const handleQuickFeedback = (rating: 'BAD' | 'AVERAGE' | 'GOOD') => {
    const { unlocked, limitReached } = addFeedbackPoints('QUICK', { rating });
    
    if (limitReached) {
        return;
    }

    if (unlocked) {
      onUnlock();
      onClose();
    } else {
      setSuccessMessage("Merci ! 😊 Votre avis aide Karongo à grandir.");
      setQuickFeedbackCount(prev => prev + 1);
      setCurrentPoints(prev => prev + 1);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    }
  };

  const handleDetailedSubmit = () => {
    if (detailedText.length < 30) return;
    const { unlocked } = addFeedbackPoints('DETAILED', { comment: detailedText });
    if (unlocked) {
      onUnlock();
      onClose();
    } else {
      setSuccessMessage("Merci ! 📝 Vos suggestions améliorent la qualité pédagogique au Faso.");
      setCurrentPoints(prev => prev + 3);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    }
  };

  const handleBugSubmit = () => {
    if (!bugText || !bugFile) return;
    const { unlocked } = addFeedbackPoints('BUG_REPORT', { comment: bugText, screenshot: bugFile });
    if (unlocked) {
      onUnlock();
      onClose();
    } else {
      setSuccessMessage("Signalement reçu ! 🛠️ Notre équipe locale analyse cela. Bonus activé !");
      setCurrentPoints(prev => prev + 5);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
            <X size={24} />
          </button>
          <div className="flex justify-between items-start">
              <div>
                  <h2 className="text-2xl font-bold mb-2">Contribuez & Gagnez !</h2>
                  <p className="text-white/90 text-sm">Aidez-nous à améliorer Karongo et débloquez des générations supplémentaires.</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-2 text-center ml-4">
                  <div className="text-xs uppercase font-bold text-white/80">Leçons</div>
                  <div className="text-xl font-bold">{isBonusAlreadyUnlocked ? '5/5' : '3/3'}</div>
              </div>
          </div>
        </div>

        {/* Progress Bar */}
        {!isBonusAlreadyUnlocked && (
            <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-3 border-b border-amber-100 dark:border-amber-800/50">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase">Points vers bonus</span>
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-400">{currentPoints} / 5</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                        className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((currentPoints / 5) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {successMessage ? (
            <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Succès !</h3>
              <p className="text-gray-600 dark:text-gray-300 px-4">{successMessage}</p>
            </div>
          ) : (
            <>
              {/* Quick Feedback */}
              <div className={`bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors ${quickFeedbackCount >= 3 ? 'opacity-75' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                      <Star size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Avis Rapide</h3>
                  </div>
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-full">+1 Point</span>
                </div>
                
                {quickFeedbackCount >= 3 ? (
                    <p className="text-sm text-red-500 font-medium mt-2 pl-12">
                        Vous avez atteint votre limite de feedbacks rapides pour aujourd'hui. Pour gagner plus de points, aidez-nous avec un commentaire détaillé ou un signalement de bug.
                    </p>
                ) : (
                    <>
                        <p className="text-sm text-gray-500 dark:text-gray-400 pl-12 mb-3">
                            Il vous reste <span className="font-bold text-amber-600">{3 - quickFeedbackCount}</span> feedback(s) rapide(s) aujourd'hui.
                        </p>
                        <div className="flex justify-between gap-2 pl-12">
                            <button onClick={() => handleQuickFeedback('BAD')} className="flex-1 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xl" title="Moyen">
                                ☹️
                            </button>
                            <button onClick={() => handleQuickFeedback('AVERAGE')} className="flex-1 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xl" title="Correct">
                                😐
                            </button>
                            <button onClick={() => handleQuickFeedback('GOOD')} className="flex-1 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xl" title="Super">
                                🙂
                            </button>
                        </div>
                    </>
                )}
              </div>

              {/* Detailed Feedback */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setFeedbackType(feedbackType === 'DETAILED' ? null : 'DETAILED')}>
                   <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <MessageSquare size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Avis Détaillé</h3>
                  </div>
                  <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">+3 Points</span>
                </div>
                
                {feedbackType === 'DETAILED' && (
                  <div className="mt-4 pl-2 animate-in slide-in-from-top-2">
                    <textarea 
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={3}
                      placeholder="Dites-nous ce que vous pensez (min. 30 caractères)..."
                      value={detailedText}
                      onChange={(e) => setDetailedText(e.target.value)}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-xs ${detailedText.length >= 30 ? 'text-green-600' : 'text-gray-400'}`}>
                        {detailedText.length} / 30 caractères
                      </span>
                      <Button onClick={handleDetailedSubmit} disabled={detailedText.length < 30}>Envoyer</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bug Report */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-red-400 transition-colors">
                <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setFeedbackType(feedbackType === 'BUG_REPORT' ? null : 'BUG_REPORT')}>
                   <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                      <Bug size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Signaler un Bug</h3>
                  </div>
                  <span className="text-xs font-bold bg-red-100 text-red-800 px-2 py-1 rounded-full">+5 Points</span>
                </div>

                {feedbackType === 'BUG_REPORT' && (
                  <div className="mt-4 pl-2 animate-in slide-in-from-top-2 space-y-3">
                    <textarea 
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                      rows={2}
                      placeholder="Décrivez le problème..."
                      value={bugText}
                      onChange={(e) => setBugText(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 flex items-center justify-center gap-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                        <Upload size={16} />
                        <span className="truncate">{bugFile ? bugFile.name : "Ajouter une capture d'écran"}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setBugFile(e.target.files?.[0] || null)} />
                      </label>
                      <Button onClick={handleBugSubmit} disabled={!bugText || !bugFile}>Envoyer</Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { Button } from '../Button';
import { User, School, BookOpen } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onComplete: () => void;
  userId: string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onComplete, userId }) => {
  const [fullName, setFullName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('CM2');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fullName,
          school_name: schoolName,
          grade_level: gradeLevel,
          points_balance: 0,
          daily_lessons_count: 0,
          last_active_date: new Date().toISOString().split('T')[0],
        });

      if (error) throw error;
      onComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden scale-100 transform transition-all relative p-8">
        
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
            <User size={32} className="text-amber-600 dark:text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">
            Complétez votre profil
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
            Ces informations nous aident à personnaliser vos leçons.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom complet *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="Ex: Ouedraogo Ali"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Établissement (Optionnel)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <School className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="Ex: École Primaire de Tanghin"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Classe enseignée
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="pl-10 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none appearance-none"
              >
                <option value="CM1">CM1</option>
                <option value="CM2">CM2</option>
                <option value="CE2">CE2</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          <Button 
            type="submit" 
            isLoading={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition-colors mt-6"
          >
            Enregistrer et continuer
          </Button>
        </form>
      </div>
    </div>
  );
};

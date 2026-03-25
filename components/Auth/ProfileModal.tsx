import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Button } from '../Button';
import { User, School, BookOpen, X, Camera } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onComplete: () => void;
  userId: string;
  onClose?: () => void;
  isEditing?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onComplete, userId, onClose, isEditing }) => {
  const [fullName, setFullName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('CM2');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && isEditing) {
      // Fetch existing profile data if editing
      const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (data) {
          setFullName(data.full_name || '');
          setSchoolName(data.school_name || '');
          setGradeLevel(data.grade_level || 'CM2');
        }
        
        // Get avatar from auth session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.user_metadata?.avatar_url) {
          setAvatarUrl(session.user.user_metadata.avatar_url);
        }
      };
      fetchProfile();
    }
  }, [isOpen, isEditing, userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB before resize)
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image est trop grande (max 5MB).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setAvatarUrl(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const updateData: any = {
        id: userId,
        full_name: fullName,
        school_name: schoolName,
        grade_level: gradeLevel,
      };
      
      // Only set these on initial creation, not on edit
      if (!isEditing) {
        updateData.points_balance = 0;
        updateData.daily_lessons_count = 0;
        updateData.last_active_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(updateData);

      if (error) throw error;

      // Update user metadata with avatar
      if (avatarUrl) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.user_metadata?.avatar_url !== avatarUrl) {
          await supabase.auth.updateUser({
            data: { avatar_url: avatarUrl }
          });
        }
      }

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
        
        {isEditing && onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        )}

        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="mx-auto w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center cursor-pointer overflow-hidden border-2 border-transparent hover:border-amber-500 transition-colors group"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-amber-600 dark:text-amber-500" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">
            {isEditing ? 'Modifier votre profil' : 'Complétez votre profil'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
            {isEditing ? 'Mettez à jour vos informations personnelles.' : 'Ces informations nous aident à personnaliser vos leçons.'}
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
                <User className="h-5 w-5 text-gray-400 dark:text-slate-400" />
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
                <School className="h-5 w-5 text-gray-400 dark:text-slate-400" />
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
                <BookOpen className="h-5 w-5 text-gray-400 dark:text-slate-400" />
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

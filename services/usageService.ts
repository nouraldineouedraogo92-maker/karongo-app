import { UserProfile, FeedbackType, FeedbackEntry } from '../types';
import { supabase } from './supabase';

const STORAGE_KEY = 'karongo_user_profile';
const DAILY_LIMIT_BASE = 3;

const DEFAULT_PROFILE: UserProfile = {
  dailyUsageCount: 0,
  lastResetDate: new Date().toISOString().split('T')[0],
  feedbackPoints: 0,
  bonusUnlocked: false,
  quickFeedbackCount: 0,
  feedbacks: [],
  points_balance: 0,
  daily_lessons_count: 0,
  last_active_date: new Date().toISOString().split('T')[0],
};

export const syncProfileWithSupabase = (remoteProfile: any) => {
  const localProfile = getProfile();
  
  const today = new Date().toISOString().split('T')[0];
  let dailyCount = remoteProfile.daily_lessons_count || 0;
  
  if (remoteProfile.last_active_date !== today) {
    dailyCount = 0;
  }

  const mergedProfile: UserProfile = {
    ...localProfile,
    id: remoteProfile.id,
    full_name: remoteProfile.full_name,
    school_name: remoteProfile.school_name,
    grade_level: remoteProfile.grade_level,
    points_balance: remoteProfile.points_balance || 0,
    daily_lessons_count: dailyCount,
    last_active_date: today,
    
    // Legacy fields mapping
    dailyUsageCount: dailyCount,
    feedbackPoints: remoteProfile.points_balance || 0,
    lastResetDate: today,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedProfile));
  window.dispatchEvent(new Event('profile-updated'));
};

export const getProfile = (): UserProfile => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return DEFAULT_PROFILE;
  }
  
  const profile = JSON.parse(stored);
  
  // Check for day reset locally just in case
  const today = new Date().toISOString().split('T')[0];
  if (profile.last_active_date !== today) {
    const newProfile = {
      ...profile,
      daily_lessons_count: 0,
      dailyUsageCount: 0,
      last_active_date: today,
      lastResetDate: today,
      quickFeedbackCount: 0
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    return newProfile;
  }
  
  return profile;
};

export const checkAccess = (): { allowed: boolean; remaining: number; total: number } => {
  const profile = getProfile();
  const limit = DAILY_LIMIT_BASE;
  const remainingFree = Math.max(0, limit - profile.daily_lessons_count);
  
  // Allowed if they have free lessons OR if they have points balance
  const allowed = remainingFree > 0 || profile.points_balance > 0;
  
  return {
    allowed,
    remaining: remainingFree,
    total: limit
  };
};

// Simulate Email Notification
const triggerEmailNotification = (feedback: FeedbackEntry) => {
    console.log("📧 [EMAIL SERVICE] Sending feedback notification:", feedback);
};

export const addFeedbackPoints = async (
    type: FeedbackType, 
    details?: { 
        rating?: 'BAD' | 'AVERAGE' | 'GOOD'; 
        comment?: string; 
        screenshot?: File 
    }
): Promise<{ unlocked: boolean; limitReached?: boolean }> => {
  const profile = getProfile();
  let points = 0;
  
  if (type === 'QUICK') {
      if (profile.quickFeedbackCount >= 3) {
          return { unlocked: false, limitReached: true };
      }
      profile.quickFeedbackCount = (profile.quickFeedbackCount || 0) + 1;
      points = 1;
  } else {
      switch (type) {
        case 'DETAILED': points = 3; break;
        case 'BUG_REPORT': points = 5; break;
      }
  }
  
  const newFeedback: FeedbackEntry = {
      id: crypto.randomUUID(),
      type,
      rating: details?.rating,
      comment: details?.comment,
      screenshotUrl: details?.screenshot ? URL.createObjectURL(details.screenshot) : undefined,
      timestamp: Date.now()
  };

  profile.feedbacks = profile.feedbacks || [];
  profile.feedbacks.push(newFeedback);
  triggerEmailNotification(newFeedback);

  // Add Points
  profile.points_balance += points;
  profile.feedbackPoints = profile.points_balance;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event('profile-updated'));

  // Sync to Supabase
  if (profile.id) {
      try {
          await supabase.from('profiles').update({
              points_balance: profile.points_balance
          }).eq('id', profile.id);
      } catch (err) {
          console.error("Failed to sync points to Supabase", err);
      }
  }
  
  return { unlocked: false };
};

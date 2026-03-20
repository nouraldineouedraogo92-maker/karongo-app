import { UserProfile, FeedbackType, FeedbackEntry } from '../types';
import { supabase } from './supabase';

const STORAGE_KEY = 'karongo_user_profile';
const DAILY_LIMIT_BASE = 3;
const BONUS_AMOUNT = 2;
const POINTS_TO_UNLOCK = 5;

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
  
  // Check if day reset is needed for remote profile
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
    
    // Map remote to local legacy fields to keep UI working without major refactor
    dailyUsageCount: dailyCount,
    feedbackPoints: remoteProfile.points_balance || 0,
    lastResetDate: today,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedProfile));
  window.dispatchEvent(new Event('profile-updated'));
  
  // If we reset the day, update remote
  if (remoteProfile.last_active_date !== today) {
    updateRemoteProfile(mergedProfile);
  }
};

const updateRemoteProfile = async (profile: UserProfile) => {
  if (!profile.id) return;
  
  try {
    await supabase.from('profiles').update({
      points_balance: profile.feedbackPoints,
      daily_lessons_count: profile.dailyUsageCount,
      last_active_date: profile.lastResetDate,
    }).eq('id', profile.id);
  } catch (err) {
    console.error("Failed to update remote profile", err);
  }
};

export const getProfile = (): UserProfile => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
    return DEFAULT_PROFILE;
  }
  
  const profile = JSON.parse(stored);
  
  // Migration for existing profiles
  if (profile.quickFeedbackCount === undefined) {
      profile.quickFeedbackCount = 0;
  }
  if (!profile.feedbacks) {
      profile.feedbacks = [];
  }

  // Check for day reset
  const today = new Date().toISOString().split('T')[0];
  if (profile.lastResetDate !== today) {
    const newProfile = {
      ...profile,
      dailyUsageCount: 0,
      daily_lessons_count: 0,
      lastResetDate: today,
      last_active_date: today,
      bonusUnlocked: false, // Reset bonus daily
      quickFeedbackCount: 0 // Reset quick feedback count
    };
    saveProfile(newProfile);
    return newProfile;
  }
  
  return profile;
};

const saveProfile = (profile: UserProfile) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event('profile-updated'));
  
  // Sync to Supabase in background
  updateRemoteProfile(profile);
};

export const checkAccess = (): { allowed: boolean; remaining: number; total: number } => {
  const profile = getProfile();
  const limit = DAILY_LIMIT_BASE + (profile.bonusUnlocked ? BONUS_AMOUNT : 0);
  const remaining = Math.max(0, limit - profile.dailyUsageCount);
  
  return {
    allowed: remaining > 0,
    remaining,
    total: limit
  };
};

export const incrementUsage = () => {
  const profile = getProfile();
  profile.dailyUsageCount += 1;
  profile.daily_lessons_count += 1;
  saveProfile(profile);
};

// Simulate Email Notification
const triggerEmailNotification = (feedback: FeedbackEntry) => {
    console.log("📧 [EMAIL SERVICE] Sending feedback notification:", feedback);
    // TODO: Brancher EmailJS ici une fois le service rétabli
};

export const addFeedbackPoints = (
    type: FeedbackType, 
    details?: { 
        rating?: 'BAD' | 'AVERAGE' | 'GOOD'; 
        comment?: string; 
        screenshot?: File 
    }
): { unlocked: boolean; limitReached?: boolean } => {
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
  
  // Create Feedback Entry
  const newFeedback: FeedbackEntry = {
      id: crypto.randomUUID(),
      type,
      rating: details?.rating,
      comment: details?.comment,
      screenshotUrl: details?.screenshot ? URL.createObjectURL(details.screenshot) : undefined, // Simulate URL
      timestamp: Date.now()
  };

  // Save Feedback
  profile.feedbacks.push(newFeedback);
  triggerEmailNotification(newFeedback);

  // Add Points
  profile.feedbackPoints += points;
  profile.points_balance += points;
  let unlocked = false;
  
  // Check if we should unlock bonus
  // Only unlock if not already unlocked for the day
  if (profile.feedbackPoints >= POINTS_TO_UNLOCK) {
    if (!profile.bonusUnlocked) {
        profile.bonusUnlocked = true;
        unlocked = true;
    }
    profile.feedbackPoints = 0; // Reset points after reaching threshold
    profile.points_balance = 0;
  }
  
  saveProfile(profile);
  return { unlocked };
};

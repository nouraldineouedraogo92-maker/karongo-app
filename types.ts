export enum Subject {
  ARITHMETIC = "Arithmétique",
  GEOMETRY = "Géométrie",
  PROBLEM_SOLVING = "Résolution de problèmes",
  METRIC_SYSTEM = "Système métrique",
  CONJUGATION = "Conjugaison",
  GRAMMAR = "Grammaire",
  VOCABULARY_USUEL = "Vocabulaire usuel",
  VOCABULARY_THEORIQUE = "Vocabulaire théorique",
  ORTHOGRAPHY = "Orthographe",
  HISTORY = "Histoire",
  GEOGRAPHY = "Géographie",
  SVT = "Sciences de la Vie et de la Terre"
}

export enum DifficultyLevel {
  EASY = "Facile",
  INTERMEDIATE = "Intermédiaire",
  ADVANCED = "Avancé"
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Lesson {
  id: string;
  topic: string;
  subject: Subject;
  difficulty?: DifficultyLevel;
  content: string; // Markdown content
  chatHistory: ChatMessage[]; // New: Store chat history with the lesson
  createdAt: number;
}

export interface GenerationRequest {
  topic: string;
  subject: Subject;
  difficulty: DifficultyLevel;
  additionalContext?: string;
  force?: boolean; // New parameter to force generation despite mismatch
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface FeedbackEntry {
  id: string;
  type: FeedbackType;
  rating?: 'BAD' | 'AVERAGE' | 'GOOD'; // For quick feedback
  comment?: string;
  screenshotUrl?: string;
  timestamp: number;
}

export interface UserProfile {
  id?: string;
  full_name?: string;
  school_name?: string;
  grade_level?: string;
  points_balance: number;
  daily_lessons_count: number;
  last_active_date: string;
  // Legacy fields for backward compatibility or local state
  dailyUsageCount: number;
  lastResetDate: string;
  feedbackPoints: number;
  bonusUnlocked: boolean;
  quickFeedbackCount: number;
  feedbacks: FeedbackEntry[]; // Store feedbacks
}

export type FeedbackType = 'QUICK' | 'DETAILED' | 'BUG_REPORT';

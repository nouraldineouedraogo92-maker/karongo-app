export enum Subject {
  ARITHMETIC = "Arithmétique",
  GEOMETRY = "Géométrie",
  PROBLEM_SOLVING = "Résolution de problèmes",
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
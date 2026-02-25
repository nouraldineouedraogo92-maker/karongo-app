import { Subject, DifficultyLevel } from './types';

export const DEFAULT_SUBJECT = Subject.ARITHMETIC;
export const DEFAULT_DIFFICULTY = DifficultyLevel.INTERMEDIATE;

export const SAMPLE_PROMPTS = [
  { topic: "Le périmètre du rectangle", subject: Subject.GEOMETRY },
  { topic: "La règle de trois", subject: Subject.ARITHMETIC },
  { topic: "Partage proportionnel", subject: Subject.PROBLEM_SOLVING },
  { topic: "La digestion", subject: Subject.SVT },
];
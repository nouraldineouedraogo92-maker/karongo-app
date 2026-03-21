import { Subject, DifficultyLevel } from './types';

export const DEFAULT_SUBJECT = Subject.ARITHMETIC;
export const DEFAULT_DIFFICULTY = DifficultyLevel.INTERMEDIATE;

export const SAMPLE_PROMPTS_CM1 = [
  { topic: "La lecture silencieuse d'un conte", subject: Subject.LECTURE },
  { topic: "Le périmètre du carré", subject: Subject.GEOMETRY },
  { topic: "Le présent de l'indicatif", subject: Subject.CONJUGATION },
  { topic: "Le relief du Burkina Faso", subject: Subject.GEOGRAPHY },
];

export const SAMPLE_PROMPTS_CM2 = [
  { topic: "Le périmètre du rectangle", subject: Subject.GEOMETRY },
  { topic: "La règle de trois", subject: Subject.ARITHMETIC },
  { topic: "L'accord du participe passé", subject: Subject.CONJUGATION },
  { topic: "Les fleuves du Burkina Faso", subject: Subject.GEOGRAPHY },
];

export const SUBJECT_GROUPS: Record<string, Subject[]> = {
  "Mathématiques": [
    Subject.ARITHMETIC, 
    Subject.GEOMETRY, 
    Subject.PROBLEM_SOLVING, 
    Subject.METRIC_SYSTEM
  ],
  "Français": [
    Subject.LECTURE,
    Subject.CONJUGATION, 
    Subject.GRAMMAR,
    Subject.VOCABULARY_USUEL,
    Subject.VOCABULARY_THEORIQUE,
    Subject.ORTHOGRAPHY
  ],
  "Sciences humaines": [
    Subject.HISTORY, 
    Subject.GEOGRAPHY
  ],
  "Observations": [
    Subject.SVT
  ],
};

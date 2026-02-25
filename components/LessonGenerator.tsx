import React, { useState } from 'react';
import { Subject, GenerationRequest, DifficultyLevel } from '../types';
import { DEFAULT_SUBJECT, DEFAULT_DIFFICULTY, SAMPLE_PROMPTS } from '../constants';
import { Button } from './Button';
import { Sparkles, ArrowRight, BarChart } from 'lucide-react';

interface LessonGeneratorProps {
  onGenerate: (req: GenerationRequest) => void;
  isLoading: boolean;
}

export const LessonGenerator: React.FC<LessonGeneratorProps> = ({ onGenerate, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState<Subject>(DEFAULT_SUBJECT);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DEFAULT_DIFFICULTY);
  const [context, setContext] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({ topic, subject, difficulty, additionalContext: context });
  };

  const fillSample = (sample: {topic: string, subject: Subject}) => {
    setTopic(sample.topic);
    setSubject(sample.subject);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-serif">Préparer une leçon</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Entrez le sujet de votre leçon de CM2. KARONGO générera une fiche complète avec des exemples du Burkina Faso.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Matière
            </label>
            <div className="space-y-2">
              {Object.values(Subject).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={`
                    w-full py-2 px-3 text-sm font-medium rounded-lg border text-left transition-all flex items-center justify-between
                    ${subject === s 
                      ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 text-amber-900 dark:text-amber-400 ring-1 ring-amber-500' 
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}
                  `}
                >
                  {s}
                  {subject === s && <div className="w-2 h-2 rounded-full bg-amber-500"></div>}
                </button>
              ))}
            </div>
          </div>

          <div>
             <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Niveau de difficulté
            </label>
            <div className="space-y-2">
              {Object.values(DifficultyLevel).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`
                    w-full py-2 px-3 text-sm font-medium rounded-lg border text-left transition-all flex items-center justify-between
                    ${difficulty === d
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-900 dark:text-blue-400 ring-1 ring-blue-500' 
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}
                  `}
                >
                  <span className="flex items-center">
                    <BarChart size={14} className="mr-2 opacity-70" />
                    {d}
                  </span>
                  {difficulty === d && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Sujet de la leçon
          </label>
          <input
            type="text"
            id="topic"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: Le périmètre du carré, La règle de trois..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow outline-none"
          />
        </div>

        <div>
          <label htmlFor="context" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Contexte (Optionnel)
          </label>
          <textarea
            id="context"
            rows={2}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Ex: Insister sur les conversions, utiliser le contexte du marché..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow outline-none resize-none"
          />
        </div>

        <Button 
          type="submit" 
          isLoading={isLoading} 
          className="w-full py-4 text-lg bg-gray-900 hover:bg-black dark:bg-amber-600 dark:hover:bg-amber-700"
          icon={<Sparkles size={20} />}
        >
          {isLoading ? 'Génération en cours...' : 'Générer la leçon'}
        </Button>
      </form>

      <div className="mt-8">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-3">Suggestions rapides</p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => fillSample(sample)}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {sample.topic}
              <ArrowRight size={10} className="ml-1 opacity-50" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
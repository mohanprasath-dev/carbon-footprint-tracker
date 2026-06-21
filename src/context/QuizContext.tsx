import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { QuizAnswer, FootprintResult } from '@/lib/calculator';
import { calculateFootprint } from '@/lib/calculator';
import { saveResult, generateId } from '@/lib/storage';
import { QUESTIONS } from '@/data/questions';

export type QuizStep = 'welcome' | 'quiz' | 'results';

interface QuizState {
  step: QuizStep;
  currentQuestionIndex: number;
  answers: Partial<QuizAnswer>;
  result: FootprintResult | null;
}

interface QuizActions {
  startQuiz: () => void;
  answerQuestion: (questionId: string, value: string) => void;
  goBack: () => void;
  submitQuiz: () => void;
  resetQuiz: () => void;
}

type QuizContextValue = QuizState & QuizActions;

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuizState>({
    step: 'welcome',
    currentQuestionIndex: 0,
    answers: {},
    result: null,
  });

  const startQuiz = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: 'quiz',
      currentQuestionIndex: 0,
      answers: {},
      result: null,
    }));
  }, []);

  const answerQuestion = useCallback((questionId: string, value: string) => {
    setState((prev) => {
      const newAnswers = { ...prev.answers, [questionId]: value };
      const isLast = prev.currentQuestionIndex === QUESTIONS.length - 1;
      if (isLast) {
        return { ...prev, answers: newAnswers, step: 'results' };
      }
      return {
        ...prev,
        answers: newAnswers,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      };
    });
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.currentQuestionIndex === 0) {
        return { ...prev, step: 'welcome' };
      }
      return {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      };
    });
  }, []);

  const submitQuiz = useCallback(() => {
    setState((prev) => {
      const completeAnswers = prev.answers as QuizAnswer;
      const result = calculateFootprint(completeAnswers);

      // Persist to localStorage
      saveResult({
        id: generateId(),
        timestamp: Date.now(),
        answers: completeAnswers,
        totalKgCO2e: result.breakdown.total,
        breakdownKg: {
          transport: result.breakdown.transport,
          diet: result.breakdown.diet,
          energy: result.breakdown.energy,
          shopping: result.breakdown.shopping,
        },
      });

      return { ...prev, result, step: 'results' };
    });
  }, []);

  const resetQuiz = useCallback(() => {
    setState({
      step: 'welcome',
      currentQuestionIndex: 0,
      answers: {},
      result: null,
    });
  }, []);

  return (
    <QuizContext.Provider
      value={{ ...state, startQuiz, answerQuestion, goBack, submitQuiz, resetQuiz }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used inside <QuizProvider>');
  return ctx;
}

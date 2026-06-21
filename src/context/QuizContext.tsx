import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { QuizAnswer } from '@/lib/calculator';
import { QUESTIONS } from '@/data/questions';

export type QuizStep = 'welcome' | 'quiz' | 'results';

interface QuizState {
  step: QuizStep;
  currentQuestionIndex: number;
  answers: Partial<QuizAnswer>;
}

interface QuizActions {
  startQuiz: () => void;
  answerQuestion: (questionId: string, value: string) => void;
  goBack: () => void;
  resetQuiz: () => void;
}

type QuizContextValue = QuizState & QuizActions;

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuizState>({
    step: 'welcome',
    currentQuestionIndex: 0,
    answers: {},
  });

  const startQuiz = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: 'quiz',
      currentQuestionIndex: 0,
      answers: {},
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

  const resetQuiz = useCallback(() => {
    setState({
      step: 'welcome',
      currentQuestionIndex: 0,
      answers: {},
    });
  }, []);

  return (
    <QuizContext.Provider value={{ ...state, startQuiz, answerQuestion, goBack, resetQuiz }}>
      {children}
    </QuizContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- paired hook for QuizProvider
export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used inside <QuizProvider>');
  return ctx;
}

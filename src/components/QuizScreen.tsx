import { useQuiz } from '@/context/QuizContext';
import { QUESTIONS, type Question } from '@/data/questions';
import './QuizScreen.css';

type QuestionCategory = Question['category'];

const CATEGORY_COLORS: Record<QuestionCategory, string> = {
  transport: 'var(--c-transport)',
  diet: 'var(--c-diet)',
  energy: 'var(--c-energy)',
  shopping: 'var(--c-shopping)',
};

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  transport: '🚗 Transport',
  diet: '🥗 Diet',
  energy: '⚡ Energy',
  shopping: '🛍️ Shopping',
};

export function QuizScreen() {
  const { currentQuestionIndex, answers, answerQuestion, goBack } = useQuiz();

  const question = QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUESTIONS.length;
  const progress = (currentQuestionIndex / totalQuestions) * 100;
  const selectedValue = answers[question.id as keyof typeof answers];

  return (
    <div className="quiz animate-fade-in">
      {/* Header bar */}
      <header className="quiz__header">
        <button
          id="quiz-back-btn"
          className="quiz__back-btn btn btn--ghost btn--sm"
          onClick={goBack}
          aria-label="Go to previous question"
        >
          ← Back
        </button>

        <span className="quiz__counter" aria-live="polite">
          {currentQuestionIndex + 1} / {totalQuestions}
        </span>
      </header>

      {/* Progress bar */}
      <div
        className="quiz__progress-track"
        role="progressbar"
        aria-valuenow={currentQuestionIndex}
        aria-valuemin={0}
        aria-valuemax={totalQuestions}
        aria-label={`Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
      >
        <div className="quiz__progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question card */}
      <main className="quiz__content container container--narrow">
        {/* Category tag */}
        <div className="quiz__category-tag" style={{ color: CATEGORY_COLORS[question.category] }}>
          {CATEGORY_LABELS[question.category]}
        </div>

        <h1 className="quiz__question" id="question-heading">
          {question.text}
        </h1>

        {question.helpText && (
          <p className="quiz__help-text" role="note">
            {question.helpText}
          </p>
        )}

        {/* Options */}
        <fieldset className="quiz__options" aria-labelledby="question-heading">
          <legend className="sr-only">Choose an answer</legend>
          {question.options.map((option) => {
            const isSelected = selectedValue === option.value;
            return (
              <button
                key={option.value}
                id={`option-${option.value}`}
                className={`quiz__option ${isSelected ? 'quiz__option--selected' : ''}`}
                onClick={() => answerQuestion(question.id, option.value)}
                aria-pressed={isSelected}
              >
                {option.icon && (
                  <span className="quiz__option-icon" aria-hidden="true">
                    {option.icon}
                  </span>
                )}
                <span className="quiz__option-label">{option.label}</span>
                {isSelected && (
                  <span className="quiz__option-check" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </fieldset>
      </main>
    </div>
  );
}

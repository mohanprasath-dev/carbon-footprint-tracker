import { useQuiz } from '@/context/QuizContext';
import { QUESTIONS } from '@/data/questions';
import './WelcomeScreen.css';

const CATEGORY_ICONS = {
  transport: '🚗',
  diet: '🥗',
  energy: '⚡',
  shopping: '🛍️',
};

const CATEGORY_LABELS = {
  transport: 'Transport',
  diet: 'Diet',
  energy: 'Home energy',
  shopping: 'Shopping',
};

export function WelcomeScreen() {
  const { startQuiz } = useQuiz();

  const totalQuestions = QUESTIONS.length;
  const categories = ['transport', 'diet', 'energy', 'shopping'] as const;

  return (
    <div className="welcome animate-fade-in">
      {/* Hero */}
      <section className="welcome__hero">
        <div className="welcome__badge">
          <span className="welcome__badge-dot" aria-hidden="true" />
          Free &amp; Privacy-First
        </div>

        <h1 className="welcome__headline">
          Know Your
          <br />
          <span className="welcome__headline-accent">Carbon Footprint</span>
        </h1>

        <p className="welcome__subtext">
          Answer {totalQuestions} questions about your lifestyle and get a personalised estimate of
          your annual CO₂ emissions — with actionable steps to reduce them.
        </p>

        <div className="welcome__cta-row">
          <button
            id="start-quiz-btn"
            className="btn btn--primary welcome__cta"
            onClick={startQuiz}
            aria-label="Start the carbon footprint quiz"
          >
            <span>Start My Assessment</span>
            <span aria-hidden="true">→</span>
          </button>
          <span className="welcome__eta">⏱ About 2 minutes</span>
        </div>
      </section>

      {/* Category pills */}
      <section className="welcome__categories" aria-label="Quiz covers these categories">
        {categories.map((cat) => (
          <div key={cat} className="welcome__category-pill">
            <span className="welcome__category-icon" aria-hidden="true">
              {CATEGORY_ICONS[cat]}
            </span>
            {CATEGORY_LABELS[cat]}
          </div>
        ))}
      </section>

      {/* Feature cards */}
      <section className="welcome__features" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          App features
        </h2>
        <article className="welcome__feature-card">
          <div className="welcome__feature-icon" aria-hidden="true">
            📊
          </div>
          <h3>Science-based</h3>
          <p>Emission factors from DEFRA 2023, EPA, and peer-reviewed research.</p>
        </article>
        <article className="welcome__feature-card">
          <div className="welcome__feature-icon" aria-hidden="true">
            🎯
          </div>
          <h3>Personalised</h3>
          <p>Recommendations ranked by your biggest impact areas, not generic tips.</p>
        </article>
        <article className="welcome__feature-card">
          <div className="welcome__feature-icon" aria-hidden="true">
            🔒
          </div>
          <h3>Private</h3>
          <p>All data stays on your device. Zero tracking, zero accounts needed.</p>
        </article>
      </section>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useQuiz } from '@/context/QuizContext';
import type { QuizAnswer } from '@/lib/calculator';
import { calculateFootprint, kgToTonnes } from '@/lib/calculator';
import { getRankedRecommendations } from '@/lib/recommendations';
import type { Recommendation } from '@/lib/recommendations';
import { persistFootprintResult } from '@/lib/storage';
import { QUESTIONS } from '@/data/questions';
import './ResultsScreen.css';

const RATING_CONFIG = {
  excellent: {
    label: 'Excellent',
    color: 'var(--c-excellent)',
    emoji: '🌟',
    bg: 'rgba(61,255,160,0.1)',
  },
  good: { label: 'Good', color: 'var(--c-good)', emoji: '😊', bg: 'rgba(134,239,172,0.1)' },
  average: { label: 'Average', color: 'var(--c-average)', emoji: '😐', bg: 'rgba(251,191,36,0.1)' },
  high: { label: 'High', color: 'var(--c-high)', emoji: '😟', bg: 'rgba(249,115,22,0.1)' },
  very_high: {
    label: 'Very High',
    color: 'var(--c-very-high)',
    emoji: '😨',
    bg: 'rgba(239,68,68,0.1)',
  },
};

const CATEGORY_CONFIG = {
  transport: { label: 'Transport', color: 'var(--c-transport)', icon: '🚗' },
  diet: { label: 'Diet', color: 'var(--c-diet)', icon: '🥗' },
  energy: { label: 'Energy', color: 'var(--c-energy)', icon: '⚡' },
  shopping: { label: 'Shopping', color: 'var(--c-shopping)', icon: '🛍️' },
};

const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', color: 'var(--c-excellent)' },
  medium: { label: 'Medium', color: 'var(--c-average)' },
  hard: { label: 'Hard', color: 'var(--c-high)' },
};

function BreakdownBar({ value, total, color }: { value: number; total: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
    const timer = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(timer);
  }, [value, total]);
  return (
    <div className="breakdown__bar-track">
      <div className="breakdown__bar-fill" style={{ width: `${width}%`, background: color }} />
    </div>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const catCfg = CATEGORY_CONFIG[rec.category];
  const diffCfg = DIFFICULTY_CONFIG[rec.difficulty];
  return (
    <article className="rec-card">
      <div className="rec-card__top">
        <span className="rec-card__icon" aria-hidden="true">
          {rec.icon}
        </span>
        <div className="rec-card__meta">
          <span className="rec-card__cat" style={{ color: catCfg.color }}>
            {catCfg.icon} {catCfg.label}
          </span>
          <span className="rec-card__diff" style={{ color: diffCfg.color }}>
            {diffCfg.label}
          </span>
        </div>
      </div>
      <h3 className="rec-card__title">{rec.title}</h3>
      <p className="rec-card__desc">{rec.description}</p>
      <div className="rec-card__saving">
        <span className="rec-card__saving-value">
          ↓ {Math.round(rec.estimatedSavingKg)} kg CO₂e/yr
        </span>
      </div>
    </article>
  );
}

export function ResultsScreen() {
  const { answers, resetQuiz } = useQuiz();
  const completeAnswers = answers as QuizAnswer;
  const allAnswered = QUESTIONS.every((q) => answers[q.id as keyof typeof answers] !== undefined);

  const result = useMemo(
    () => (allAnswered ? calculateFootprint(completeAnswers) : null),
    [allAnswered, completeAnswers],
  );

  const recommendations = useMemo(
    () => (result ? getRankedRecommendations(completeAnswers, result, 6) : []),
    [completeAnswers, result],
  );

  useEffect(() => {
    if (!result) return;
    persistFootprintResult(completeAnswers, result);
  }, [completeAnswers, result]);

  if (!result) {
    return (
      <div className="results__loading" role="status" aria-live="polite">
        <div className="results__spinner" aria-hidden="true" />
        <p>Calculating your footprint…</p>
      </div>
    );
  }

  const ratingCfg = RATING_CONFIG[result.rating];
  const totalKg = result.breakdown.total;
  const totalTonnes = kgToTonnes(totalKg);
  const categories = ['transport', 'diet', 'energy', 'shopping'] as const;

  return (
    <div className="results animate-fade-in">
      <div className="container">
        <section className="results__hero" aria-labelledby="results-heading">
          <div
            className="results__rating-badge"
            style={{
              color: ratingCfg.color,
              background: ratingCfg.bg,
              borderColor: ratingCfg.color,
            }}
          >
            <span aria-hidden="true">{ratingCfg.emoji}</span> {ratingCfg.label}
          </div>
          <h1 id="results-heading" className="results__total">
            <span className="results__number">{totalTonnes}</span>
            <span className="results__unit">tonnes CO₂e / year</span>
          </h1>
          <div className="results__comparison">
            <div className="results__comparison-item">
              <span className="results__comparison-value" style={{ color: ratingCfg.color }}>
                {result.vsGlobalAverage}%
              </span>
              <span className="results__comparison-label">of global avg (4.7t)</span>
            </div>
            <div className="results__comparison-sep" aria-hidden="true" />
            <div className="results__comparison-item">
              <span className="results__comparison-value">{result.vsTarget}%</span>
              <span className="results__comparison-label">of 1.5°C target (2.5t)</span>
            </div>
          </div>
        </section>

        <section className="results__breakdown card" aria-labelledby="breakdown-heading">
          <h2 id="breakdown-heading">Emission Breakdown</h2>
          <div className="breakdown__list">
            {categories.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const value = result.breakdown[cat];
              const pct = totalKg > 0 ? Math.round((value / totalKg) * 100) : 0;
              return (
                <div key={cat} className="breakdown__item">
                  <div className="breakdown__item-header">
                    <span className="breakdown__item-label">
                      <span aria-hidden="true">{cfg.icon}</span> {cfg.label}
                    </span>
                    <span className="breakdown__item-values">
                      <strong>{kgToTonnes(value)}t</strong>
                      <span className="breakdown__pct">({pct}%)</span>
                    </span>
                  </div>
                  <BreakdownBar value={value} total={totalKg} color={cfg.color} />
                </div>
              );
            })}
          </div>
        </section>

        {recommendations.length > 0 && (
          <section className="results__recs" aria-labelledby="recs-heading">
            <h2 id="recs-heading">Your Top Actions</h2>
            <p className="results__recs-intro">Ranked by potential impact for your lifestyle:</p>
            <div className="results__recs-grid">
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))}
            </div>
          </section>
        )}

        <div className="results__footer">
          <button id="retake-quiz-btn" className="btn btn--ghost" onClick={resetQuiz}>
            ↺ Retake Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

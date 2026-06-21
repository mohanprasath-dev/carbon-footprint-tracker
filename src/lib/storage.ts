/**
 * Local storage persistence helpers for carbon footprint tracker.
 * All data is stored only on the user's device — no network calls.
 */

import type { FootprintResult, QuizAnswer } from '@/lib/calculator';

const STORAGE_KEY = 'cft_quiz_results';

const QUIZ_ANSWER_KEYS: (keyof QuizAnswer)[] = [
  'vehicle_type',
  'driving_frequency',
  'public_transport',
  'flights',
  'diet_type',
  'food_waste',
  'energy_source',
  'home_size',
  'shopping_clothing',
  'shopping_electronics',
];

export interface StoredResult {
  id: string;
  timestamp: number;
  answers: QuizAnswer;
  totalKgCO2e: number;
  breakdownKg: {
    transport: number;
    diet: number;
    energy: number;
    shopping: number;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isQuizAnswer(value: unknown): value is QuizAnswer {
  if (!isRecord(value)) return false;
  return QUIZ_ANSWER_KEYS.every((key) => typeof value[key] === 'string');
}

function isBreakdownKg(value: unknown): value is StoredResult['breakdownKg'] {
  if (!isRecord(value)) return false;
  return (
    isFiniteNumber(value.transport) &&
    isFiniteNumber(value.diet) &&
    isFiniteNumber(value.energy) &&
    isFiniteNumber(value.shopping)
  );
}

function isStoredResult(value: unknown): value is StoredResult {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    isFiniteNumber(value.timestamp) &&
    isQuizAnswer(value.answers) &&
    isFiniteNumber(value.totalKgCO2e) &&
    isBreakdownKg(value.breakdownKg)
  );
}

function parseStoredResults(raw: string): StoredResult[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  if (!parsed.every(isStoredResult)) return [];
  return parsed;
}

export function saveResult(result: StoredResult): void {
  const existing = loadResults();
  const updated = [result, ...existing].slice(0, 10); // keep last 10
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function persistFootprintResult(answers: QuizAnswer, footprint: FootprintResult): void {
  saveResult({
    id: generateId(),
    timestamp: Date.now(),
    answers,
    totalKgCO2e: footprint.breakdown.total,
    breakdownKg: {
      transport: footprint.breakdown.transport,
      diet: footprint.breakdown.diet,
      energy: footprint.breakdown.energy,
      shopping: footprint.breakdown.shopping,
    },
  });
}

export function loadResults(): StoredResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return parseStoredResults(raw);
  } catch {
    return [];
  }
}

export function clearResults(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

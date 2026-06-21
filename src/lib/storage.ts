/**
 * Local storage persistence helpers for carbon footprint tracker.
 * All data is stored only on the user's device — no network calls.
 */

import type { QuizAnswer } from '@/lib/calculator';

const STORAGE_KEY = 'cft_quiz_results';

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

export function saveResult(result: StoredResult): void {
  const existing = loadResults();
  const updated = [result, ...existing].slice(0, 10); // keep last 10
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function loadResults(): StoredResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredResult[];
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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveResult, loadResults, clearResults, generateId } from '@/lib/storage';
import type { StoredResult } from '@/lib/storage';

const mockResult = (id = 'test-1', totalKgCO2e = 5000): StoredResult => ({
  id,
  timestamp: 1700000000000,
  answers: {
    vehicle_type: 'car_petrol',
    driving_frequency: 'commuter',
    public_transport: 'sometimes',
    flights: 'short_1_2',
    diet_type: 'meat_medium',
    food_waste: 'medium',
    energy_source: 'electricity_grid',
    home_size: 'medium_couple',
    shopping_clothing: 'sometimes',
    shopping_electronics: 'sometimes',
  },
  totalKgCO2e,
  breakdownKg: { transport: 1500, diet: 2000, energy: 1000, shopping: 500 },
});

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('loadResults', () => {
    it('returns empty array when localStorage is empty', () => {
      expect(loadResults()).toEqual([]);
    });

    it('returns empty array for malformed localStorage data', () => {
      localStorage.setItem('cft_quiz_results', 'not-valid-json{{{');
      expect(loadResults()).toEqual([]);
    });
  });

  describe('saveResult', () => {
    it('saves a result and retrieves it', () => {
      const result = mockResult();
      saveResult(result);
      const loaded = loadResults();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('test-1');
    });

    it('prepends new results (most recent first)', () => {
      saveResult(mockResult('first', 5000));
      saveResult(mockResult('second', 6000));
      const loaded = loadResults();
      expect(loaded[0].id).toBe('second');
      expect(loaded[1].id).toBe('first');
    });

    it('caps stored results at 10', () => {
      for (let i = 0; i < 15; i++) {
        saveResult(mockResult(`result-${i}`, 5000 + i));
      }
      const loaded = loadResults();
      expect(loaded.length).toBeLessThanOrEqual(10);
    });
  });

  describe('clearResults', () => {
    it('clears all stored results', () => {
      saveResult(mockResult());
      clearResults();
      expect(loadResults()).toEqual([]);
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()));
      expect(ids.size).toBe(100);
    });

    it('returns a non-empty string', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });
});

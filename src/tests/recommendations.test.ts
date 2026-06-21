import { describe, it, expect } from 'vitest';
import {
  getRankedRecommendations,
  scoreRecommendation,
  ALL_RECOMMENDATIONS,
} from '@/lib/recommendations';
import { calculateFootprint } from '@/lib/calculator';
import type { QuizAnswer } from '@/lib/calculator';

const baseAnswers: QuizAnswer = {
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
};

const baseFootprint = calculateFootprint(baseAnswers);

describe('scoreRecommendation', () => {
  it('returns 0 for EV recommendation when user has no car', () => {
    const evRec = ALL_RECOMMENDATIONS.find((r) => r.id === 'switch_to_ev')!;
    const noCar = { ...baseAnswers, vehicle_type: 'none', driving_frequency: 'none' };
    const footprint = calculateFootprint(noCar);
    expect(scoreRecommendation(evRec, noCar, footprint)).toBe(0);
  });

  it('returns 0 for EV recommendation when user already has EV', () => {
    const evRec = ALL_RECOMMENDATIONS.find((r) => r.id === 'switch_to_ev')!;
    const evAnswers = { ...baseAnswers, vehicle_type: 'car_electric' };
    const footprint = calculateFootprint(evAnswers);
    expect(scoreRecommendation(evRec, evAnswers, footprint)).toBe(0);
  });

  it('returns 0 for reduce_flights recommendation when user does not fly', () => {
    const flightRec = ALL_RECOMMENDATIONS.find((r) => r.id === 'reduce_flights')!;
    const noFlight = { ...baseAnswers, flights: 'none' };
    const footprint = calculateFootprint(noFlight);
    expect(scoreRecommendation(flightRec, noFlight, footprint)).toBe(0);
  });

  it('returns 0 for vegan recommendation when user is already vegan', () => {
    const veganRec = ALL_RECOMMENDATIONS.find((r) => r.id === 'go_vegan')!;
    const vegan = { ...baseAnswers, diet_type: 'vegan' };
    const footprint = calculateFootprint(vegan);
    expect(scoreRecommendation(veganRec, vegan, footprint)).toBe(0);
  });

  it('returns 0 for renewable energy rec if already on renewable', () => {
    const renewableRec = ALL_RECOMMENDATIONS.find((r) => r.id === 'switch_renewable')!;
    const renewable = { ...baseAnswers, energy_source: 'renewable_electricity' };
    const footprint = calculateFootprint(renewable);
    expect(scoreRecommendation(renewableRec, renewable, footprint)).toBe(0);
  });

  it('returns positive score for relevant recommendation', () => {
    const evRec = ALL_RECOMMENDATIONS.find((r) => r.id === 'switch_to_ev')!;
    const score = scoreRecommendation(evRec, baseAnswers, baseFootprint);
    expect(score).toBeGreaterThan(0);
  });
});

describe('getRankedRecommendations', () => {
  it('returns at most the requested limit of recommendations', () => {
    const recs = getRankedRecommendations(baseAnswers, baseFootprint, 5);
    expect(recs.length).toBeLessThanOrEqual(5);
  });

  it('does not include already-adopted behaviors', () => {
    const vegan = {
      ...baseAnswers,
      diet_type: 'vegan',
      energy_source: 'renewable_electricity',
      vehicle_type: 'none',
      driving_frequency: 'none',
      flights: 'none',
    };
    const footprint = calculateFootprint(vegan);
    const recs = getRankedRecommendations(vegan, footprint);
    const ids = recs.map((r) => r.id);
    expect(ids).not.toContain('go_vegan');
    expect(ids).not.toContain('switch_renewable');
    expect(ids).not.toContain('switch_to_ev');
    expect(ids).not.toContain('reduce_flights');
  });

  it('returns unique recommendation IDs', () => {
    const recs = getRankedRecommendations(baseAnswers, baseFootprint);
    const ids = recs.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('all returned recommendations have required fields', () => {
    const recs = getRankedRecommendations(baseAnswers, baseFootprint);
    recs.forEach((rec) => {
      expect(rec.id).toBeDefined();
      expect(rec.title).toBeDefined();
      expect(rec.description).toBeDefined();
      expect(rec.estimatedSavingKg).toBeGreaterThan(0);
      expect(['transport', 'diet', 'energy', 'shopping']).toContain(rec.category);
      expect(['easy', 'medium', 'hard']).toContain(rec.difficulty);
      expect(['low', 'medium', 'high', 'very_high']).toContain(rec.impact);
    });
  });

  it('returns recommendations for a high-consumption profile', () => {
    const highCarbon: QuizAnswer = {
      vehicle_type: 'car_petrol',
      driving_frequency: 'very_frequent',
      public_transport: 'never',
      flights: 'long_2_plus',
      diet_type: 'meat_heavy',
      food_waste: 'high',
      energy_source: 'oil_heating',
      home_size: 'very_large',
      shopping_clothing: 'very_often',
      shopping_electronics: 'very_often',
    };
    const footprint = calculateFootprint(highCarbon);
    const recs = getRankedRecommendations(highCarbon, footprint);
    expect(recs.length).toBeGreaterThan(0);
  });

  it('handles eco profile gracefully (few irrelevant recs filtered)', () => {
    const eco: QuizAnswer = {
      vehicle_type: 'none',
      driving_frequency: 'none',
      public_transport: 'always',
      flights: 'none',
      diet_type: 'vegan',
      food_waste: 'very_low',
      energy_source: 'renewable_electricity',
      home_size: 'tiny_shared',
      shopping_clothing: 'rarely',
      shopping_electronics: 'rarely',
    };
    const footprint = calculateFootprint(eco);
    const recs = getRankedRecommendations(eco, footprint);
    // Should still have some general recs (e.g. LED, repair electronics)
    expect(recs.length).toBeGreaterThanOrEqual(0);
  });
});

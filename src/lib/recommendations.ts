/**
 * Personalized action recommendations module.
 *
 * Recommendations are ranked by their estimated potential CO2e saving (kg/year)
 * relative to the user's current footprint profile.
 */

import type { QuizAnswer, FootprintResult } from '@/lib/calculator';

export interface Recommendation {
  id: string;
  category: 'transport' | 'diet' | 'energy' | 'shopping';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /** Estimated annual kg CO2e savings */
  estimatedSavingKg: number;
  /** Human-readable impact label */
  impact: 'low' | 'medium' | 'high' | 'very_high';
  icon: string;
  actionUrl?: string;
}

// ── Raw recommendation pool ──────────────────────────────────────────────────

const ALL_RECOMMENDATIONS: Recommendation[] = [
  // Transport
  {
    id: 'switch_to_ev',
    category: 'transport',
    title: 'Switch to an Electric Vehicle',
    description:
      'EVs produce ~72% less CO2 than petrol cars over their lifetime, even accounting for manufacturing.',
    difficulty: 'hard',
    estimatedSavingKg: 1500,
    impact: 'very_high',
    icon: '⚡',
  },
  {
    id: 'carpool',
    category: 'transport',
    title: 'Carpool or Rideshare',
    description:
      'Sharing a car journey with just one other person halves your per-km transport emissions.',
    difficulty: 'easy',
    estimatedSavingKg: 700,
    impact: 'high',
    icon: '🚗',
  },
  {
    id: 'cycle_short_trips',
    category: 'transport',
    title: 'Cycle or Walk Short Journeys',
    description:
      'Replacing car trips under 5 km with cycling or walking eliminates those emissions entirely.',
    difficulty: 'easy',
    estimatedSavingKg: 400,
    impact: 'high',
    icon: '🚲',
  },
  {
    id: 'use_public_transport',
    category: 'transport',
    title: 'Switch Commute to Public Transport',
    description:
      'Buses emit ~54% less and trains ~79% less CO2 per passenger-km than a solo petrol car.',
    difficulty: 'medium',
    estimatedSavingKg: 600,
    impact: 'high',
    icon: '🚇',
  },
  {
    id: 'reduce_flights',
    category: 'transport',
    title: 'Take One Fewer Long-Haul Flight',
    description:
      'A single return long-haul flight emits ~2-3 tonnes CO2e — the largest single-action saving for many people.',
    difficulty: 'medium',
    estimatedSavingKg: 2200,
    impact: 'very_high',
    icon: '✈️',
  },
  {
    id: 'flight_economy',
    category: 'transport',
    title: 'Fly Economy Class',
    description:
      'Business class has roughly 3× the carbon footprint of economy due to floor space allocation.',
    difficulty: 'easy',
    estimatedSavingKg: 500,
    impact: 'medium',
    icon: '💺',
  },

  // Diet
  {
    id: 'go_vegan',
    category: 'diet',
    title: 'Try a Plant-Based Diet',
    description:
      'A vegan diet produces ~50% less CO2 than a meat-heavy diet — the single biggest dietary switch.',
    difficulty: 'hard',
    estimatedSavingKg: 1850,
    impact: 'very_high',
    icon: '🌱',
  },
  {
    id: 'reduce_red_meat',
    category: 'diet',
    title: 'Cut Red Meat to 3× Per Week',
    description:
      'Beef produces 20× more CO2 than plant protein. Reducing to 3 servings/week saves ~500 kg CO2e/year.',
    difficulty: 'medium',
    estimatedSavingKg: 500,
    impact: 'high',
    icon: '🥗',
  },
  {
    id: 'meat_free_monday',
    category: 'diet',
    title: 'Have One Meat-Free Day Per Week',
    description:
      'Even one plant-based day a week saves approximately 200 kg CO2e annually.',
    difficulty: 'easy',
    estimatedSavingKg: 200,
    impact: 'medium',
    icon: '🥦',
  },
  {
    id: 'reduce_food_waste',
    category: 'diet',
    title: 'Halve Your Food Waste',
    description:
      'Meal planning and proper storage. Food waste contributes ~8% of global greenhouse gas emissions.',
    difficulty: 'easy',
    estimatedSavingKg: 125,
    impact: 'medium',
    icon: '♻️',
  },
  {
    id: 'eat_seasonal_local',
    category: 'diet',
    title: 'Choose Seasonal & Local Produce',
    description:
      'Air-freighted out-of-season produce can emit 50× more CO2 than local seasonal equivalents.',
    difficulty: 'easy',
    estimatedSavingKg: 150,
    impact: 'medium',
    icon: '🍅',
  },

  // Energy
  {
    id: 'switch_renewable',
    category: 'energy',
    title: 'Switch to a Renewable Energy Tariff',
    description:
      'Choosing a certified 100% renewable tariff can cut your home electricity emissions by ~86%.',
    difficulty: 'easy',
    estimatedSavingKg: 900,
    impact: 'very_high',
    icon: '☀️',
  },
  {
    id: 'install_heat_pump',
    category: 'energy',
    title: 'Install a Heat Pump',
    description:
      'Heat pumps are 3× more efficient than gas boilers. Cutting home heating emissions by up to 70%.',
    difficulty: 'hard',
    estimatedSavingKg: 1200,
    impact: 'very_high',
    icon: '🌡️',
  },
  {
    id: 'smart_thermostat',
    category: 'energy',
    title: 'Install a Smart Thermostat',
    description:
      'Smart thermostats reduce heating/cooling energy use by 10–23%, saving up to 240 kg CO2e/year.',
    difficulty: 'easy',
    estimatedSavingKg: 240,
    impact: 'medium',
    icon: '🏠',
  },
  {
    id: 'insulate_home',
    category: 'energy',
    title: 'Improve Home Insulation',
    description:
      'Loft and wall insulation reduce heat loss by up to 45%, cutting heating bills and emissions significantly.',
    difficulty: 'hard',
    estimatedSavingKg: 800,
    impact: 'high',
    icon: '🧱',
  },
  {
    id: 'led_lighting',
    category: 'energy',
    title: 'Switch All Bulbs to LED',
    description:
      'LEDs use 75% less energy than incandescent bulbs and last 25× longer.',
    difficulty: 'easy',
    estimatedSavingKg: 50,
    impact: 'low',
    icon: '💡',
  },

  // Shopping
  {
    id: 'buy_secondhand',
    category: 'shopping',
    title: 'Buy Second-Hand Clothing',
    description:
      'The fashion industry produces 10% of global CO2. Buying secondhand avoids new production emissions.',
    difficulty: 'easy',
    estimatedSavingKg: 200,
    impact: 'medium',
    icon: '👕',
  },
  {
    id: 'repair_electronics',
    category: 'shopping',
    title: 'Repair & Extend Electronics Lifespan',
    description:
      'Manufacturing a smartphone produces ~70 kg CO2e. Extending device life by 1 year significantly reduces impact.',
    difficulty: 'easy',
    estimatedSavingKg: 150,
    impact: 'medium',
    icon: '🔧',
  },
  {
    id: 'reduce_fast_fashion',
    category: 'shopping',
    title: 'Avoid Fast Fashion — Buy Less, Better',
    description:
      'Buying half as many clothing items at better quality reduces textile emissions substantially.',
    difficulty: 'medium',
    estimatedSavingKg: 300,
    impact: 'medium',
    icon: '🛍️',
  },
];

// ── Ranking logic ────────────────────────────────────────────────────────────

/** Difficulty weights for ranking (easier recommendations scored higher ceteris paribus). */
const DIFFICULTY_WEIGHT: Record<Recommendation['difficulty'], number> = {
  easy: 1.3,
  medium: 1.0,
  hard: 0.7,
};

/**
 * Score a recommendation for ranking.
 * Score = estimatedSavingKg × difficultyWeight × relevanceBonus
 */
export function scoreRecommendation(
  rec: Recommendation,
  answers: QuizAnswer,
  footprint: FootprintResult,
): number {
  let relevanceBonus = 1.0;

  // Boost transport recs if user is a heavy driver
  if (
    rec.category === 'transport' &&
    footprint.breakdown.transport > footprint.breakdown.total * 0.4
  ) {
    relevanceBonus = 1.5;
  }

  // Suppress EV rec if user already has EV or no car
  if (rec.id === 'switch_to_ev' && (answers.vehicle_type === 'car_electric' || answers.vehicle_type === 'none')) {
    return 0;
  }

  // Suppress flight reduction if user doesn't fly
  if (rec.id === 'reduce_flights' && answers.flights === 'none') {
    return 0;
  }

  // Suppress economy class if user doesn't fly
  if (rec.id === 'flight_economy' && answers.flights === 'none') {
    return 0;
  }

  // Suppress public transport if already primary mode
  if (rec.id === 'use_public_transport' && answers.public_transport === 'always') {
    return 0;
  }

  // Suppress renewable energy if already using it
  if (
    rec.id === 'switch_renewable' &&
    answers.energy_source === 'renewable_electricity'
  ) {
    return 0;
  }

  // Suppress heat pump if already using one
  if (rec.id === 'install_heat_pump' && answers.energy_source === 'heat_pump') {
    return 0;
  }

  // Boost diet recs if diet is a major category contributor
  if (
    rec.category === 'diet' &&
    footprint.breakdown.diet > footprint.breakdown.total * 0.4
  ) {
    relevanceBonus = 1.3;
  }

  // Suppress go_vegan if already vegan
  if (rec.id === 'go_vegan' && answers.diet_type === 'vegan') {
    return 0;
  }

  // Suppress reduce_red_meat if vegetarian/vegan
  if (
    (rec.id === 'reduce_red_meat' || rec.id === 'meat_free_monday') &&
    (answers.diet_type === 'vegan' || answers.diet_type === 'vegetarian')
  ) {
    return 0;
  }

  // Suppress food waste rec if already very low
  if (rec.id === 'reduce_food_waste' && answers.food_waste === 'very_low') {
    return 0;
  }

  return rec.estimatedSavingKg * DIFFICULTY_WEIGHT[rec.difficulty] * relevanceBonus;
}

/**
 * Get ranked, de-duplicated recommendations personalized to user answers.
 * @returns Top recommendations sorted by score descending
 */
export function getRankedRecommendations(
  answers: QuizAnswer,
  footprint: FootprintResult,
  limit = 8,
): Recommendation[] {
  const scored = ALL_RECOMMENDATIONS.map((rec) => ({
    rec,
    score: scoreRecommendation(rec, answers, footprint),
  }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ rec }) => rec);
}

export { ALL_RECOMMENDATIONS };

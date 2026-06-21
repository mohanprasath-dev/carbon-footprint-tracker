import type { QuizAnswer } from '@/lib/calculator';

export interface Question {
  id: string;
  category: 'transport' | 'diet' | 'energy' | 'shopping';
  text: string;
  helpText?: string;
  options: { value: string; label: string; icon?: string }[];
}

export const QUESTIONS: Question[] = [
  // ── Transport ──────────────────────────────────────────────────────────────
  {
    id: 'vehicle_type',
    category: 'transport',
    text: 'What is your primary personal vehicle?',
    helpText: 'Choose the vehicle you drive most frequently.',
    options: [
      { value: 'none', label: "I don't own a car", icon: '🚶' },
      { value: 'car_electric', label: 'Electric car', icon: '⚡' },
      { value: 'car_hybrid', label: 'Hybrid car', icon: '🌿' },
      { value: 'car_petrol', label: 'Petrol / gasoline car', icon: '⛽' },
      { value: 'car_diesel', label: 'Diesel car', icon: '🔵' },
      { value: 'motorcycle', label: 'Motorcycle / scooter', icon: '🏍️' },
    ],
  },
  {
    id: 'driving_frequency',
    category: 'transport',
    text: 'How much do you drive per week?',
    options: [
      { value: 'none', label: 'I rarely or never drive', icon: '🚫' },
      { value: 'occasional', label: 'Occasionally (under 50 km/week)', icon: '🌱' },
      { value: 'commuter', label: 'Daily commute (50–200 km/week)', icon: '🏙️' },
      { value: 'frequent', label: 'Frequent driver (200–500 km/week)', icon: '🛣️' },
      { value: 'very_frequent', label: 'Very frequent (500+ km/week)', icon: '🛞' },
    ],
  },
  {
    id: 'public_transport',
    category: 'transport',
    text: 'How often do you use public transport?',
    options: [
      { value: 'never', label: 'Never', icon: '✗' },
      { value: 'rarely', label: 'Rarely (a few times/month)', icon: '🔵' },
      { value: 'sometimes', label: 'Sometimes (1–3 days/week)', icon: '🟡' },
      { value: 'often', label: 'Often (4+ days/week)', icon: '🟢' },
      { value: 'always', label: 'My main mode of travel', icon: '🚇' },
    ],
  },
  {
    id: 'flights',
    category: 'transport',
    text: 'How many flights did you take in the past year?',
    helpText: 'Include both short-haul and long-haul flights.',
    options: [
      { value: 'none', label: 'No flights', icon: '🚫' },
      { value: 'short_1_2', label: '1–2 short-haul flights (under 3 hours)', icon: '✈️' },
      { value: 'short_3_plus', label: '3+ short-haul flights', icon: '✈️✈️' },
      { value: 'long_1', label: '1 long-haul flight (over 3 hours)', icon: '🌍' },
      { value: 'long_2_plus', label: '2+ long-haul flights', icon: '🌏' },
    ],
  },

  // ── Diet ───────────────────────────────────────────────────────────────────
  {
    id: 'diet_type',
    category: 'diet',
    text: 'Which best describes your diet?',
    helpText: 'Meat production is one of the largest contributors to food-related emissions.',
    options: [
      { value: 'vegan', label: 'Vegan (no animal products)', icon: '🌱' },
      { value: 'vegetarian', label: 'Vegetarian (no meat or fish)', icon: '🥦' },
      { value: 'pescatarian', label: 'Pescatarian (fish, no other meat)', icon: '🐟' },
      { value: 'meat_light', label: 'Low-meat (meat a few times/week)', icon: '🥗' },
      { value: 'meat_medium', label: 'Average omnivore', icon: '🍖' },
      { value: 'meat_heavy', label: 'High-meat (meat most meals)', icon: '🥩' },
    ],
  },
  {
    id: 'food_waste',
    category: 'diet',
    text: 'How much food do you typically throw away?',
    helpText: 'Food waste releases methane in landfill, a potent greenhouse gas.',
    options: [
      { value: 'very_low', label: 'Almost none — I plan meals carefully', icon: '♻️' },
      { value: 'low', label: 'A little — small amounts occasionally', icon: '🟢' },
      { value: 'medium', label: 'Some — a few items per week', icon: '🟡' },
      { value: 'high', label: 'Quite a bit — leftovers often go to bin', icon: '🔴' },
    ],
  },

  // ── Energy ─────────────────────────────────────────────────────────────────
  {
    id: 'energy_source',
    category: 'energy',
    text: 'What is your main source of home energy?',
    options: [
      {
        value: 'renewable_electricity',
        label: 'Renewable electricity (solar/wind tariff)',
        icon: '☀️',
      },
      { value: 'electricity_grid', label: 'Standard grid electricity', icon: '🔌' },
      { value: 'heat_pump', label: 'Heat pump (air or ground source)', icon: '🌡️' },
      { value: 'natural_gas', label: 'Natural gas (central heating)', icon: '🔥' },
      { value: 'oil_heating', label: 'Oil heating', icon: '🛢️' },
    ],
  },
  {
    id: 'home_size',
    category: 'energy',
    text: 'How large is your home, and how many people share it?',
    helpText: "We'll use this to estimate your per-person energy use.",
    options: [
      { value: 'tiny_shared', label: 'Small flat / 3+ people sharing', icon: '🏠' },
      { value: 'medium_couple', label: 'Medium home / 2 people', icon: '🏡' },
      { value: 'large_single', label: 'Large home / live alone', icon: '🏘️' },
      { value: 'large_family', label: 'Large home / small family (3–4)', icon: '👨‍👩‍👧' },
      { value: 'very_large', label: 'Very large / multiple cars / high usage', icon: '🏰' },
    ],
  },

  // ── Shopping ───────────────────────────────────────────────────────────────
  {
    id: 'shopping_clothing',
    category: 'shopping',
    text: 'How often do you buy new clothing?',
    options: [
      { value: 'rarely', label: 'Rarely — mostly second-hand / minimal', icon: '♻️' },
      { value: 'sometimes', label: 'A few times a year', icon: '👕' },
      { value: 'often', label: 'Monthly', icon: '🛍️' },
      { value: 'very_often', label: 'Very frequently (fast fashion)', icon: '👗' },
    ],
  },
  {
    id: 'shopping_electronics',
    category: 'shopping',
    text: 'How often do you upgrade your electronics?',
    helpText: 'Manufacturing electronics is highly carbon-intensive.',
    options: [
      { value: 'rarely', label: 'Only when broken / every 5+ years', icon: '🔧' },
      { value: 'sometimes', label: 'Every 3–4 years', icon: '📱' },
      { value: 'often', label: 'Every 1–2 years', icon: '💻' },
      { value: 'very_often', label: 'Very frequently (multiple devices/year)', icon: '🖥️' },
    ],
  },
];

export type QuizAnswers = QuizAnswer;

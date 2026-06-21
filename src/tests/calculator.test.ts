import { describe, it, expect } from 'vitest';
import {
  calculateTransportEmissions,
  calculateDietEmissions,
  calculateEnergyEmissions,
  calculateShoppingEmissions,
  calculateFootprint,
  getRating,
  kgToTonnes,
} from '@/lib/calculator';

// ── Helper: build a full default answer set ──────────────────────────────────
const defaultAnswers = {
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

// ── calculateTransportEmissions ──────────────────────────────────────────────

describe('calculateTransportEmissions', () => {
  it('returns 0 for a non-driver who never flies and never uses PT', () => {
    const result = calculateTransportEmissions({
      vehicle_type: 'none',
      driving_frequency: 'none',
      public_transport: 'never',
      flights: 'none',
    });
    expect(result).toBe(0);
  });

  it('returns higher emissions for petrol car than electric for same driving frequency', () => {
    const petrolResult = calculateTransportEmissions({
      vehicle_type: 'car_petrol',
      driving_frequency: 'commuter',
      public_transport: 'never',
      flights: 'none',
    });
    const evResult = calculateTransportEmissions({
      vehicle_type: 'car_electric',
      driving_frequency: 'commuter',
      public_transport: 'never',
      flights: 'none',
    });
    expect(petrolResult).toBeGreaterThan(evResult);
  });

  it('adds flight emissions on top of driving', () => {
    const withoutFlights = calculateTransportEmissions({
      vehicle_type: 'car_petrol',
      driving_frequency: 'commuter',
      public_transport: 'never',
      flights: 'none',
    });
    const withFlights = calculateTransportEmissions({
      vehicle_type: 'car_petrol',
      driving_frequency: 'commuter',
      public_transport: 'never',
      flights: 'long_1',
    });
    expect(withFlights).toBeGreaterThan(withoutFlights);
  });

  it('returns non-negative values for all vehicle types', () => {
    const vehicleTypes = [
      'none',
      'car_electric',
      'car_hybrid',
      'car_petrol',
      'car_diesel',
      'motorcycle',
    ];
    vehicleTypes.forEach((vehicle_type) => {
      const result = calculateTransportEmissions({
        vehicle_type,
        driving_frequency: 'commuter',
        public_transport: 'never',
        flights: 'none',
      });
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  it('produces more emissions with more driving frequency', () => {
    const occasional = calculateTransportEmissions({
      vehicle_type: 'car_petrol',
      driving_frequency: 'occasional',
      public_transport: 'never',
      flights: 'none',
    });
    const veryFrequent = calculateTransportEmissions({
      vehicle_type: 'car_petrol',
      driving_frequency: 'very_frequent',
      public_transport: 'never',
      flights: 'none',
    });
    expect(veryFrequent).toBeGreaterThan(occasional);
  });
});

// ── calculateDietEmissions ───────────────────────────────────────────────────

describe('calculateDietEmissions', () => {
  it('vegan diet produces lowest emissions', () => {
    const vegan = calculateDietEmissions({ diet_type: 'vegan', food_waste: 'very_low' });
    const meatHeavy = calculateDietEmissions({ diet_type: 'meat_heavy', food_waste: 'very_low' });
    expect(vegan).toBeLessThan(meatHeavy);
  });

  it('meat_heavy diet produces more emissions than vegetarian', () => {
    const vegetarian = calculateDietEmissions({ diet_type: 'vegetarian', food_waste: 'low' });
    const meatHeavy = calculateDietEmissions({ diet_type: 'meat_heavy', food_waste: 'low' });
    expect(meatHeavy).toBeGreaterThan(vegetarian);
  });

  it('high food waste increases emissions vs very_low', () => {
    const lowWaste = calculateDietEmissions({ diet_type: 'meat_medium', food_waste: 'very_low' });
    const highWaste = calculateDietEmissions({ diet_type: 'meat_medium', food_waste: 'high' });
    expect(highWaste).toBeGreaterThan(lowWaste);
  });

  it('returns positive values for all diet types', () => {
    const dietTypes = [
      'vegan',
      'vegetarian',
      'pescatarian',
      'meat_light',
      'meat_medium',
      'meat_heavy',
    ];
    dietTypes.forEach((diet_type) => {
      const result = calculateDietEmissions({ diet_type, food_waste: 'low' });
      expect(result).toBeGreaterThan(0);
    });
  });

  it('diet emissions are in plausible range (500–3500 kg CO2e/year)', () => {
    const result = calculateDietEmissions({ diet_type: 'meat_medium', food_waste: 'medium' });
    expect(result).toBeGreaterThan(500);
    expect(result).toBeLessThan(3500);
  });
});

// ── calculateEnergyEmissions ─────────────────────────────────────────────────

describe('calculateEnergyEmissions', () => {
  it('renewable electricity produces less than grid electricity', () => {
    const renewable = calculateEnergyEmissions({
      energy_source: 'renewable_electricity',
      home_size: 'medium_couple',
    });
    const grid = calculateEnergyEmissions({
      energy_source: 'electricity_grid',
      home_size: 'medium_couple',
    });
    expect(renewable).toBeLessThan(grid);
  });

  it('larger home with single occupant produces more per-person than shared flat', () => {
    const shared = calculateEnergyEmissions({
      energy_source: 'electricity_grid',
      home_size: 'tiny_shared',
    });
    const largeSingle = calculateEnergyEmissions({
      energy_source: 'electricity_grid',
      home_size: 'large_single',
    });
    expect(largeSingle).toBeGreaterThan(shared);
  });

  it('returns non-negative values', () => {
    const result = calculateEnergyEmissions({
      energy_source: 'renewable_electricity',
      home_size: 'tiny_shared',
    });
    expect(result).toBeGreaterThanOrEqual(0);
  });
});

// ── calculateShoppingEmissions ───────────────────────────────────────────────

describe('calculateShoppingEmissions', () => {
  it('frequent shoppers produce more than rare shoppers', () => {
    const rare = calculateShoppingEmissions({
      shopping_clothing: 'rarely',
      shopping_electronics: 'rarely',
    });
    const frequent = calculateShoppingEmissions({
      shopping_clothing: 'very_often',
      shopping_electronics: 'very_often',
    });
    expect(frequent).toBeGreaterThan(rare);
  });

  it('returns non-negative values', () => {
    const result = calculateShoppingEmissions({
      shopping_clothing: 'rarely',
      shopping_electronics: 'rarely',
    });
    expect(result).toBeGreaterThanOrEqual(0);
  });
});

// ── calculateFootprint ───────────────────────────────────────────────────────

describe('calculateFootprint', () => {
  it('total equals sum of category emissions', () => {
    const result = calculateFootprint(defaultAnswers);
    const expectedTotal =
      result.breakdown.transport +
      result.breakdown.diet +
      result.breakdown.energy +
      result.breakdown.shopping;
    expect(result.breakdown.total).toBeCloseTo(expectedTotal, 2);
  });

  it('returns vsGlobalAverage as percentage', () => {
    const result = calculateFootprint(defaultAnswers);
    expect(result.vsGlobalAverage).toBeGreaterThan(0);
    expect(result.vsGlobalAverage).toBeTypeOf('number');
  });

  it('returns a valid rating', () => {
    const result = calculateFootprint(defaultAnswers);
    expect(['excellent', 'good', 'average', 'high', 'very_high']).toContain(result.rating);
  });

  it('eco-friendly choices produce lower total than high-consumption choices', () => {
    const eco = calculateFootprint({
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
    });
    const highCarbon = calculateFootprint({
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
    });
    expect(eco.breakdown.total).toBeLessThan(highCarbon.breakdown.total);
  });

  it('eco profile receives excellent or good rating', () => {
    const eco = calculateFootprint({
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
    });
    expect(['excellent', 'good']).toContain(eco.rating);
  });
});

// ── getRating ────────────────────────────────────────────────────────────────

describe('getRating', () => {
  it('returns excellent for very low footprint', () => {
    expect(getRating(1000)).toBe('excellent');
  });
  it('returns good for moderate-low footprint', () => {
    expect(getRating(3000)).toBe('good');
  });
  it('returns average for moderate footprint', () => {
    expect(getRating(5000)).toBe('average');
  });
  it('returns high for high footprint', () => {
    expect(getRating(8000)).toBe('high');
  });
  it('returns very_high for very high footprint', () => {
    expect(getRating(12000)).toBe('very_high');
  });
});

// ── kgToTonnes ───────────────────────────────────────────────────────────────

describe('kgToTonnes', () => {
  it('converts 1000 kg to 1 tonne', () => {
    expect(kgToTonnes(1000)).toBe(1);
  });
  it('converts 2500 kg to 2.5 tonnes', () => {
    expect(kgToTonnes(2500)).toBe(2.5);
  });
  it('rounds to 2 decimal places', () => {
    expect(kgToTonnes(3333)).toBe(3.33);
  });
  it('returns 0 for 0 input', () => {
    expect(kgToTonnes(0)).toBe(0);
  });
});

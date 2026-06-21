/**
 * Carbon footprint calculator module.
 *
 * All emission values are in kg CO2e per year unless noted.
 *
 * Sources:
 *  - DEFRA Greenhouse Gas Conversion Factors 2023
 *  - EPA Emission Factors 2023
 *  - IEA CO2 Emissions from Fuel Combustion 2022
 *  - Poore & Nemecek (2018) "Reducing food's environmental impacts through producers and consumers"
 */

import { EMISSION_FACTORS, FLIGHT_DISTANCES, DRIVING_WEEKLY_KM } from '@/data/emissionFactors';

export interface QuizAnswer {
  vehicle_type: string;
  driving_frequency: string;
  public_transport: string;
  flights: string;
  diet_type: string;
  food_waste: string;
  energy_source: string;
  home_size: string;
  shopping_clothing: string;
  shopping_electronics: string;
}

export interface EmissionBreakdown {
  transport: number;
  diet: number;
  energy: number;
  shopping: number;
  total: number;
}

export interface FootprintResult {
  breakdown: EmissionBreakdown;
  /** Percentage against global average */
  vsGlobalAverage: number;
  /** Percentage against 1.5°C compatible target */
  vsTarget: number;
  /** Qualitative rating */
  rating: 'excellent' | 'good' | 'average' | 'high' | 'very_high';
}

// ── Transport calculation ────────────────────────────────────────────────────

/**
 * Calculate annual transport emissions in kg CO2e.
 */
export function calculateTransportEmissions(
  answers: Pick<QuizAnswer, 'vehicle_type' | 'driving_frequency' | 'public_transport' | 'flights'>,
): number {
  // Driving
  const weeklyKm = DRIVING_WEEKLY_KM[answers.driving_frequency] ?? 0;
  const annualKm = weeklyKm * 52;
  const drivingFactor =
    answers.vehicle_type === 'none'
      ? 0
      : (EMISSION_FACTORS.transport[
          answers.vehicle_type as keyof typeof EMISSION_FACTORS.transport
        ] ?? EMISSION_FACTORS.transport.car_petrol);
  const drivingEmissions = annualKm * drivingFactor;

  // Public transport offset/addition
  // If user relies mainly on public transport, add bus/train mix emissions
  const ptMultiplier: Record<string, number> = {
    never: 0,
    rarely: 0.05,
    sometimes: 0.15,
    often: 0.35,
    always: 0.5,
  };
  const ptFraction = ptMultiplier[answers.public_transport] ?? 0;
  // Assume 50% bus / 50% train mix for public transport users, ~120 km/week when main mode
  const ptWeeklyKm = ptFraction * 120;
  const ptAnnualKm = ptWeeklyKm * 52;
  const ptFactor = (EMISSION_FACTORS.transport.bus + EMISSION_FACTORS.transport.train) / 2;
  const ptEmissions = ptAnnualKm * ptFactor;

  // Flights
  const flightKm = FLIGHT_DISTANCES[answers.flights] ?? 0;
  const flightFactor =
    flightKm > 3000
      ? EMISSION_FACTORS.transport.flight_long
      : EMISSION_FACTORS.transport.flight_short;
  const flightEmissions = flightKm * flightFactor;

  return drivingEmissions + ptEmissions + flightEmissions;
}

// ── Diet calculation ─────────────────────────────────────────────────────────

/** Calculate annual diet emissions in kg CO2e. */
export function calculateDietEmissions(
  answers: Pick<QuizAnswer, 'diet_type' | 'food_waste'>,
): number {
  const dietKey = answers.diet_type as keyof typeof EMISSION_FACTORS.diet;
  const dailyEmission = EMISSION_FACTORS.diet[dietKey] ?? EMISSION_FACTORS.diet.meat_medium;
  const annualDietEmissions = dailyEmission * 365;

  // Food waste addition (kg CO2e per year)
  const wasteFactors: Record<string, number> = {
    very_low: 0, // near zero waste
    low: 25, // ~10 kg food wasted * 2.5
    medium: 100, // ~40 kg food wasted * 2.5
    high: 250, // ~100 kg food wasted * 2.5
  };
  const wasteEmissions = wasteFactors[answers.food_waste] ?? 0;

  return annualDietEmissions + wasteEmissions;
}

// ── Energy calculation ───────────────────────────────────────────────────────

/** Calculate annual home energy emissions in kg CO2e. */
export function calculateEnergyEmissions(
  answers: Pick<QuizAnswer, 'energy_source' | 'home_size'>,
): number {
  // Annual kWh per person based on home size and occupancy
  const annualKwhPerPerson: Record<string, number> = {
    tiny_shared: 800,
    medium_couple: 1800,
    large_single: 3500,
    large_family: 2000,
    very_large: 5000,
  };
  const kwhUsed = annualKwhPerPerson[answers.home_size] ?? 2000;

  const energyKey = answers.energy_source as keyof typeof EMISSION_FACTORS.energy;
  const energyFactor =
    EMISSION_FACTORS.energy[energyKey] ?? EMISSION_FACTORS.energy.electricity_grid;

  return kwhUsed * energyFactor;
}

// ── Shopping calculation ─────────────────────────────────────────────────────

/** Calculate annual shopping/consumption emissions in kg CO2e. */
export function calculateShoppingEmissions(
  answers: Pick<QuizAnswer, 'shopping_clothing' | 'shopping_electronics'>,
): number {
  // Clothing: annual spend equivalent (£)
  const clothingSpend: Record<string, number> = {
    rarely: 100,
    sometimes: 400,
    often: 900,
    very_often: 2000,
  };
  const clothingEmissions =
    (clothingSpend[answers.shopping_clothing] ?? 400) * EMISSION_FACTORS.shopping.clothing;

  // Electronics: annualised lifecycle cost
  const electronicsSpend: Record<string, number> = {
    rarely: 50, // ~£250/5yr
    sometimes: 100, // ~£400/4yr
    often: 300, // ~£600/2yr
    very_often: 700,
  };
  const electronicsEmissions =
    (electronicsSpend[answers.shopping_electronics] ?? 100) * EMISSION_FACTORS.shopping.electronics;

  return clothingEmissions + electronicsEmissions;
}

// ── Master calculator ────────────────────────────────────────────────────────

/** Calculate full carbon footprint from quiz answers. */
export function calculateFootprint(answers: QuizAnswer): FootprintResult {
  const transport = calculateTransportEmissions(answers);
  const diet = calculateDietEmissions(answers);
  const energy = calculateEnergyEmissions(answers);
  const shopping = calculateShoppingEmissions(answers);
  const total = transport + diet + energy + shopping;

  const globalAvg = EMISSION_FACTORS.baseline.global_average;
  const target = EMISSION_FACTORS.baseline.target_2030;

  const vsGlobalAverage = Math.round((total / globalAvg) * 100);
  const vsTarget = Math.round((total / target) * 100);

  const rating = getRating(total);

  return {
    breakdown: { transport, diet, energy, shopping, total },
    vsGlobalAverage,
    vsTarget,
    rating,
  };
}

/** Assign qualitative rating based on total annual kg CO2e. */
export function getRating(totalKgCO2e: number): FootprintResult['rating'] {
  if (totalKgCO2e < 2500) return 'excellent'; // At or below 1.5°C target
  if (totalKgCO2e < 4000) return 'good'; // Below global average
  if (totalKgCO2e < 6500) return 'average'; // Around global average
  if (totalKgCO2e < 10000) return 'high'; // Above global average
  return 'very_high'; // At or above UK/EU average
}

/** Convert kg to tonnes with 2 decimal places. */
export function kgToTonnes(kg: number): number {
  return Math.round((kg / 1000) * 100) / 100;
}

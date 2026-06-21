// Emission factors sourced from:
// - UK DEFRA Greenhouse Gas Conversion Factors 2023
// - EPA Emission Factors for Greenhouse Gas Inventories (2023)
// - IEA Electricity CO2 Emissions Factor (2022 global average)
// - IPCC AR6 (2021) transport emission data
// - Our World in Data dietary carbon footprint estimates

export const EMISSION_FACTORS = {
  // Transport: kg CO2e per km
  transport: {
    car_petrol: 0.192, // avg petrol car (DEFRA 2023)
    car_diesel: 0.171, // avg diesel car (DEFRA 2023)
    car_electric: 0.053, // EV with global avg grid (IEA 2022)
    car_hybrid: 0.12, // plug-in hybrid avg
    motorcycle: 0.114, // avg motorbike (DEFRA 2023)
    bus: 0.089, // local bus (DEFRA 2023)
    train: 0.041, // national rail avg (DEFRA 2023)
    metro: 0.028, // metro/subway avg
    cycling: 0.0, // zero direct emissions
    walking: 0.0, // zero direct emissions
    flight_short: 0.255, // <3h domestic/regional per km (DEFRA 2023)
    flight_long: 0.195, // long-haul per km with RFI factor
  },

  // Diet: kg CO2e per day per person
  diet: {
    meat_heavy: 7.19, // >100g meat/day (Poore & Nemecek 2018)
    meat_medium: 5.63, // avg omnivore
    meat_light: 3.91, // low meat (<50g/day)
    pescatarian: 3.18, // fish-eating, no meat
    vegetarian: 2.89, // no meat or fish
    vegan: 2.09, // no animal products
  },

  // Home energy: kg CO2e per kWh
  energy: {
    electricity_grid: 0.233, // global avg (IEA 2022)
    natural_gas: 0.203, // per kWh gas (DEFRA 2023)
    renewable_electricity: 0.033, // certified renewable tariff
    oil_heating: 0.245, // heating oil per kWh
    heat_pump: 0.078, // COP ~3 with avg grid
  },

  // Shopping: kg CO2e per £/$ spend category
  shopping: {
    clothing: 0.0098, // per £ (WRAP 2017 est.)
    electronics: 0.015, // per £ (avg lifecycle)
    furniture: 0.006, // per £
    food_waste: 2.5, // per kg wasted food (avg)
  },

  // Annual baseline per person (kg CO2e)
  baseline: {
    global_average: 4600, // OWID 2022 global avg
    uk_average: 10000, // UK per capita (DEFRA 2022)
    us_average: 14700, // US per capita (EPA 2021)
    eu_average: 8700, // EU per capita
    target_2030: 2500, // 1.5°C compatible annual budget
    target_2050: 1000, // Net-zero compatible
  },
} as const;

// Flight distance lookup (km, one-way)
export const FLIGHT_DISTANCES: Record<string, number> = {
  none: 0,
  short_1_2: 1500, // 1-2 short-haul flights/year → avg 1500km
  short_3_plus: 4000, // 3+ short-haul → avg 4000km total
  long_1: 8000, // 1 long-haul (e.g. transatlantic)
  long_2_plus: 18000, // 2+ long-haul
};

// Weekly driving distance by frequency (km/week)
export const DRIVING_WEEKLY_KM: Record<string, number> = {
  none: 0,
  occasional: 50, // <5 days, short trips
  commuter: 160, // daily commuter, ~32km/day
  frequent: 400, // multiple long trips/week
  very_frequent: 700, // heavy driver
};

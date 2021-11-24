export enum CHECK_TYPE {
  eq = 'Equal',
  ne = 'Not equal',
  gt = 'Greater than',
  ge = 'Greater than or equal',
  lt = 'Less than',
  le = 'Less than or equal',
}
export enum INTERVAL_UNIT {
  m = 'minute',
  h = 'hour',
  d = 'day',
  w = 'week',
}
export enum AGGREGATE_TYPE {
  average = 'Average',
  max = 'Maximum',
  min = 'Minimum',
  count = 'Count',
  sum = 'Sum',
  stepInterpolation = 'Step interpolation',
  interpolation = 'Interpolation',
  totalVariation = 'Total variation',
  continuousVariance = 'Continuous variance',
  discreteVariance = 'Discreet variance',
  latest = 'Latest',
}

enum GAS_RATE_UNIT {
  'MMscf/day' = 'MMscf/day',
  '1000Sm3/d' = '1000Sm3/d',
  '1000m3/d' = '1000m3/d',
  'm3[Vn]/h' = 'm3[Vn]/h',
  'Mscf/day' = 'Mscf/day',
  'scf/day' = 'scf/day',
  'Sm3/day' = 'Sm3/day',
}
enum PRESSURE_UNIT {
  psig = 'psig',
  psia = 'psia',
  BARg = 'BARg',
  BARa = 'BARa',
  'kPa g' = 'kPa g',
  'kPa a' = 'kPa a',
  'Kg/cm2 g' = 'Kg/cm2 g',
  'Kg/cm2 a' = 'Kg/cm2 a',
  'atm a' = 'atm a',
}
enum LIQUID_RATE_UNIT {
  'STB/day' = 'STB/day',
  'Sm3/day' = 'Sm3/day',
  'm3/day' = 'm3/day',
  'm3/hour' = 'm3/hour',
  'scf/day' = 'scf/day',
}
enum LIQUID_RATE_GAS_RATE_UNIT {
  'STB/MMscf' = 'STB/MMscf',
  'Sm3/Sm3' = 'Sm3/Sm3',
  'm3/m3' = 'm3/m3',
  'm3/m3Vn' = 'm3/m3Vn',
  'STB/m3Vn' = 'STB/m3Vn',
  'Sm3/kSm3' = 'Sm3/kSm3',
  'Sm3/MSm3' = 'Sm3/MSm3',
}
enum TEMPERATURE_UNIT {
  'deg F' = '°F',
  'deg C' = '°C',
  'deg R' = '°R',
  'deg K' = '°K',
}

export const MISC_UNITS = {
  percent: '%',
  feet: 'ft',
  meters: 'm',
} as const;

export const UNIT_TYPE: { [x: string]: { [x: string]: string } } =
  Object.freeze({
    Pressure: PRESSURE_UNIT,
    GasRate: GAS_RATE_UNIT,
    LiqRate: LIQUID_RATE_UNIT,
    Temperature: TEMPERATURE_UNIT,
    'LiqRate/GasRate': LIQUID_RATE_GAS_RATE_UNIT,
  });

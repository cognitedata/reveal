export const PSI = 'psi';
export const LBM_OVER_BBL = 'lbm/bbl';
export const PPG = 'ppg';
export const SG = 'sg';
export const METER = 'm';
export const FEET = 'ft';
export const MILLIMETER = 'mm';
export const CENTIMETER = 'cm';

export const PSI_TO_PPG_CONVERSION_FACTOR_FT = 0.052;
export const LBM_BBL_TO_PPG_CONVERSION_FACTOR = 1 / 42;
export const SG_TO_PPG_CONVERSION_FACTOR_FT = 8.33;
export const PSI_TO_SG_CONVERSION_FACTOR_FT = 0.433;
export const METER_TO_FEET_FACTOR = 3.281;

export enum UserPreferredUnit {
  FEET = 'ft',
  METER = 'm',
}

export enum DistanceUnit {
  FEET = 'ft',
  METER = 'm',
  MILLIMETER = 'mm',
  CENTIMETER = 'cm',
}

export enum PressureUnit {
  PSI = 'psi',
  LBM_OVER_BBL = 'lbm/bbl',
  PPG = 'ppg',
  SG = 'sg',
}

/**
 * Measurment unit for trajectory, depth measurements
 */
export enum DepthMeasurementUnit {
  TVD = 'TVD',
  MD = 'MD',
}

export const PRESSURE_UNITS = [
  PressureUnit.PPG,
  PressureUnit.PSI,
  PressureUnit.SG,
];

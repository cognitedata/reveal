import { DepthMeasurementUnit, PressureUnit } from 'constants/units';

export const VIEW_MODES = ['Wells', 'Curves'];
export const PRESSURE_UNITS = [
  PressureUnit.PPG,
  PressureUnit.PSI,
  PressureUnit.SG,
];
export const MEASUREMENTS_REFERENCES = [
  DepthMeasurementUnit.TVD,
  DepthMeasurementUnit.MD,
];
export const DEFAULT_PRESSURE_UNIT = PRESSURE_UNITS[0];
export const DEFAULT_MEASUREMENTS_REFERENCE = MEASUREMENTS_REFERENCES[0];

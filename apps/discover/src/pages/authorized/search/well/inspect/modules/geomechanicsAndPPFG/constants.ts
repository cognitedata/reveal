import { DepthMeasurementUnit, PressureUnit } from 'constants/units';

import { MeasurementUnits } from './types';

export const DEFAULT_MEASUREMENT_UNITS: MeasurementUnits = {
  pressureUnit: PressureUnit.PPG,
  depthMeasurementType: DepthMeasurementUnit.TVD,
};

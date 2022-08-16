import { useMemo } from 'react';

import { DepthMeasurementUnit, PressureUnit } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { MeasurementUnits } from '../types';

export const useDefaultMeasurementUnits = (): MeasurementUnits => {
  const { data: depthUnit } = useUserPreferencesMeasurement();

  return useMemo(
    () => ({
      pressureUnit: PressureUnit.PPG,
      depthMeasurementType: DepthMeasurementUnit.TVD,
      depthUnit,
    }),
    [depthUnit]
  );
};

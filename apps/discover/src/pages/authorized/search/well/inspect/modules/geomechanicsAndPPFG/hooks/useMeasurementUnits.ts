import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { DepthMeasurementUnit, PressureUnit } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { MeasurementUnits } from '../types';

export const useMeasurementUnits = (): [
  MeasurementUnits,
  Dispatch<SetStateAction<MeasurementUnits>>
] => {
  const { data: depthUnit } = useUserPreferencesMeasurement();

  const [measurementUnits, setMeasurementUnits] = useState<MeasurementUnits>({
    pressureUnit: PressureUnit.PPG,
    depthMeasurementType: DepthMeasurementUnit.TVD,
    depthUnit,
  });

  useEffect(() => {
    setMeasurementUnits((measurementUnits) => ({
      ...measurementUnits,
      depthUnit,
    }));
  }, [depthUnit]);

  return [measurementUnits, setMeasurementUnits];
};

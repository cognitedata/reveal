import { DepthMeasurementUnit, PressureUnit } from 'constants/units';

import { NestedSelectorOption } from '../components/NestedSelector';
import { MeasurementUnits } from '../types';

export const PRESSURE_UNITS = [
  PressureUnit.PPG,
  PressureUnit.PSI,
  PressureUnit.SG,
];

export const MEASUREMENTS_REFERENCES = [
  DepthMeasurementUnit.TVD,
  DepthMeasurementUnit.MD,
];

export const MEASUREMENTS_UNIT_SELECTOR_OPTIONS: NestedSelectorOption<MeasurementUnits>[] =
  [
    {
      key: 'pressureUnit',
      label: 'Pressure unit',
      options: PRESSURE_UNITS,
    },
  ];

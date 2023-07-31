import { DepthMeasurementUnit, PRESSURE_UNITS } from 'constants/units';

import { NestedSelectorOption } from '../components/NestedSelector';
import { MeasurementUnits } from '../types';

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

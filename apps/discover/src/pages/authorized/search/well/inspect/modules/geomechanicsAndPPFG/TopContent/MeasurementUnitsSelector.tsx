import React from 'react';

import {
  NestedSelector,
  NestedSelectorOption,
} from '../components/NestedSelector';
import { MeasurementUnits } from '../types';

export interface MeasurementUnitsSelectorProps {
  options: NestedSelectorOption<MeasurementUnits>[];
  value: MeasurementUnits;
  onChange: (measurementUnits: MeasurementUnits) => void;
}

export const MeasurementUnitsSelector: React.FC<
  MeasurementUnitsSelectorProps
> = ({ options, value, onChange }) => {
  return (
    <NestedSelector<MeasurementUnits>
      id="measurements-unit-selector"
      options={options}
      value={value}
      onChange={(key, selectedOption) =>
        onChange({
          ...value,
          [key]: selectedOption,
        })
      }
    />
  );
};

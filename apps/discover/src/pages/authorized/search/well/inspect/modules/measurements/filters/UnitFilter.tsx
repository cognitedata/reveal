import React from 'react';

import { OptionType, Select } from '@cognite/cogs.js';

import { PressureUnit, DepthMeasurementUnit } from 'constants/units';

import { DropdownWrapper } from './elements';
import { mapCollectionToOptions } from './utils';

export interface Props<T extends PressureUnit | DepthMeasurementUnit> {
  title: string;
  selected: T;
  options: T[];
  onChange: (value: T) => void;
}

export const UnitFilter = <T extends PressureUnit | DepthMeasurementUnit>({
  title,
  selected,
  options,
  onChange,
}: Props<T>) => {
  const optionsMap = mapCollectionToOptions(options);
  return (
    <DropdownWrapper>
      <Select
        theme="grey"
        title={title}
        value={optionsMap.filter((option) => option.value === selected)}
        onChange={(option: OptionType<T>) => {
          if (option.value) {
            onChange(option.value);
          }
        }}
        options={optionsMap}
        placeholderSelectElement={selected}
        closeMenuOnSelect
      />
    </DropdownWrapper>
  );
};

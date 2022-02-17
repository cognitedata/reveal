import React from 'react';

import { OptionType, Select } from '@cognite/cogs.js';

import { DropdownWrapper } from './elements';
import { mapStringCurvesToOptions } from './utils';

interface Props {
  title: string;
  selected: string;
  options: string[];
  onChange: (value: string) => void;
}

export const UnitFilter: React.FC<Props> = ({
  title,
  selected,
  options,
  onChange,
}) => {
  const optionsMap = mapStringCurvesToOptions(options);
  return (
    <DropdownWrapper>
      <Select
        theme="grey"
        title={title}
        value={optionsMap.filter((option) => option.value === selected)}
        onChange={(option: OptionType<string>) => {
          onChange(option.value || '');
        }}
        options={optionsMap}
        placeholderSelectElement={selected}
        closeMenuOnSelect
      />
    </DropdownWrapper>
  );
};

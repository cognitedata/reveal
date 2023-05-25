import { useMemo, useState } from 'react';

import { OptionType, Select as CogsSelect } from '@cognite/cogs.js';

import head from 'lodash/head';
import isUndefined from 'lodash/isUndefined';

import { SelectWrapper } from './elements';
import { mapOptionsToOptionType, mapOptionToOptionType } from './utils';

export interface SelectProps<T extends string> {
  options: T[];
  value?: T;
  defaultSelectFirstOption?: boolean;
  onChange: (value: T) => void;
}

export const Select = <T extends string>({
  options,
  value,
  defaultSelectFirstOption = true,
  onChange,
}: SelectProps<T>) => {
  const [selectedOption, setSelectedOption] = useState<OptionType<T>>();

  const selectOptions = useMemo(() => {
    return mapOptionsToOptionType(options);
  }, [options]);

  const selectValue = useMemo(() => {
    if (value) {
      return mapOptionToOptionType(value);
    }

    if (selectedOption) {
      return selectedOption;
    }

    if (defaultSelectFirstOption) {
      return head(selectOptions);
    }
  }, [defaultSelectFirstOption, selectOptions, selectedOption, value]);

  return (
    <SelectWrapper>
      <CogsSelect
        disableTyping
        theme="grey"
        options={selectOptions}
        value={selectValue}
        onChange={(option: OptionType<T>) => {
          setSelectedOption(option);

          if (!isUndefined(option.value)) {
            onChange(option.value);
          }
        }}
      />
    </SelectWrapper>
  );
};

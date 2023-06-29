import { useMemo, useState } from 'react';

import head from 'lodash/head';
import isUndefined from 'lodash/isUndefined';

import { OptionType, Select as CogsSelect } from '@cognite/cogs.js';

import { useTranslation } from '../../../../../hooks/useTranslation';

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
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState<OptionType<T>>();

  const selectOptions = useMemo(() => {
    return mapOptionsToOptionType(options, t);
  }, [options]);

  const selectValue = useMemo(() => {
    if (value) {
      return mapOptionToOptionType(value, t);
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
        disabled={options.length < 2}
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

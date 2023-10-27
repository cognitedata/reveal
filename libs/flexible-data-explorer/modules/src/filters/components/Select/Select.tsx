import { useMemo, useState } from 'react';

import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import get from 'lodash/get';
import head from 'lodash/head';
import isUndefined from 'lodash/isUndefined';

import { OptionType, Select as CogsSelect } from '@cognite/cogs.js';

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
  ...rest
}: SelectProps<T>) => {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState<OptionType<T>>();

  const selectOptions = useMemo(() => {
    return mapOptionsToOptionType(options, t);
  }, [options, t]);

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
  }, [defaultSelectFirstOption, selectOptions, selectedOption, value, t]);

  return (
    <SelectWrapper data-testid={get(rest, 'data-testid')}>
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

import React, { useState } from 'react';

import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';
import { caseInsensitiveSort } from 'utils/sort';

import { Select, OptionType } from '@cognite/cogs.js';

import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import {
  formatOptionLabelDefault,
  renderMultiSelectDropdown,
  renderPlaceholderSelectElement,
  renderTitleAboveSelectComponent,
} from './commonMultiSelectComponents';
import { MultiSelectContainer } from './elements';
import { MultiSelectProps, MultiSelectOptionType } from './types';

const getValueFromOption = (option: OptionType<MultiSelectOptionType>) =>
  get(option.value, 'value', option.value);

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options: data = [],
  selectedOptions,
  onValueChange,
  isTextCapitalized = false,
  isOptionsSorted = true,
  footer = () => null,
  title,
  titlePlacement = 'default',
  displayValue,
  theme,
  formatOptionLabel,
  placeholderSelectElement,
  hideClearIndicator,
  styles,
  extraLabels = {},
  ...rest
}) => {
  const options: OptionType<MultiSelectOptionType>[] = useDeepMemo(() => {
    const processedOptions = data.map((option: MultiSelectOptionType) => {
      const value = get(option, 'value', option);
      const label = [value, extraLabels[value]].filter(Boolean).join(' ');
      const helpText = get(option, 'helpText');

      return {
        label,
        value: option,
        helpText,
      };
    });

    return isOptionsSorted
      ? processedOptions.sort((optionA, optionB) =>
          caseInsensitiveSort(
            getValueFromOption(optionA),
            getValueFromOption(optionB)
          )
        )
      : processedOptions;
  }, [data, isOptionsSorted, extraLabels]);

  const [value, setValue] = useState<OptionType<MultiSelectOptionType>[]>([]);

  useDeepEffect(() => {
    if (isUndefined(selectedOptions)) return;

    const value = options.filter((option) =>
      selectedOptions.includes(getValueFromOption(option))
    );
    setValue(value);
  }, [options, selectedOptions]);

  const onChange = (values: OptionType<MultiSelectOptionType>[]) => {
    if (isUndefined(selectedOptions)) {
      setValue(values);
    }
    onValueChange((values || []).map((option) => getValueFromOption(option)));
  };

  return (
    <MultiSelectContainer
      outlined={isUndefined(theme)}
      hideClearIndicator={hideClearIndicator}
      data-testid="multi-select-container"
      aria-label={`${title} list`}
    >
      {renderTitleAboveSelectComponent(title, titlePlacement)}
      <Select
        isMulti
        options={options}
        // aria-labelledby={title}
        value={value}
        onChange={onChange}
        formatOptionLabel={
          formatOptionLabel || formatOptionLabelDefault(isTextCapitalized)
        }
        title={titlePlacement === 'default' && title}
        placeholderSelectElement={renderPlaceholderSelectElement(
          placeholderSelectElement,
          displayValue
        )}
        theme={theme}
        dropdownRender={renderMultiSelectDropdown(footer)}
        styles={styles}
        {...rest}
      />
    </MultiSelectContainer>
  );
};

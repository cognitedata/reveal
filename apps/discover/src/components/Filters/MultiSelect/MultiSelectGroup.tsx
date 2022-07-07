import React, { useState } from 'react';

import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';
import { sortByCaseInsensitive } from 'utils/sort';

import { Select, OptionType } from '@cognite/cogs.js';

import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import {
  formatOptionLabelDefault,
  renderMultiSelectDropdown,
  renderPlaceholderSelectElement,
  renderTitleAboveSelectComponent,
} from './commonMultiSelectComponents';
import { MULTISELECT_NO_RESULTS } from './constants';
import { MultiSelectContainer } from './elements';
import { MultiSelectOptionType, MultiSelectGroupProps } from './types';

export const MultiSelectGroup: React.FC<MultiSelectGroupProps> = ({
  groupedOptions: groupedData = [],
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
  ...rest
}) => {
  const groupedOptions = useDeepMemo(() => {
    return groupedData.map((item) => {
      const processedOptions = item.options.map((option) => ({
        label: get(option, 'value', option),
        value: option,
      }));

      return {
        ...item,
        options: isOptionsSorted
          ? processedOptions.sort((a, b) =>
              sortByCaseInsensitive(a.label, b.label)
            )
          : processedOptions,
      };
    });
  }, [groupedData]);

  const [value, setValue] = useState<OptionType<MultiSelectOptionType>[]>([]);

  useDeepEffect(() => {
    if (isUndefined(selectedOptions)) return;

    const value = groupedOptions
      .flatMap((item) => [...item.options])
      .filter((option) => selectedOptions.includes(option.label))
      .sort((a, b) => sortByCaseInsensitive(a.label, b.label));

    setValue(value);
  }, [groupedOptions, selectedOptions]);

  const onChange = (values: OptionType<MultiSelectOptionType>[]) => {
    if (isUndefined(selectedOptions)) {
      setValue(values);
    }
    onValueChange((values || []).map((option) => option.label));
  };

  return (
    <MultiSelectContainer
      outlined={isUndefined(theme)}
      hideClearIndicator={hideClearIndicator}
      data-testid="multi-select-group-container"
      aria-label={`${title} list`}
    >
      {renderTitleAboveSelectComponent(title, titlePlacement)}
      <Select
        isMulti
        options={groupedOptions}
        // aria-labelledby={title}
        value={value}
        onChange={onChange}
        isOptionDisabled={(option: { value: string }) => {
          // Since data structure to the component is of just an array of string,
          // it is a bit cumbersome to specify which options should be disabled
          // higher up in the component hierarchy. For now, just make the string
          // "No options available" the default fallback for no options.
          return option.value === MULTISELECT_NO_RESULTS;
        }}
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

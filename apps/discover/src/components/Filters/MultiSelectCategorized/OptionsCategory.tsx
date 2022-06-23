import React from 'react';

import isEmpty from 'lodash/isEmpty';
import { toBooleanMap } from 'utils/booleanMap';

import { Checkbox, OptionType } from '@cognite/cogs.js';

import { MultiSelectOptionType } from '../MultiSelect/types';

import {
  CategoryWrapper,
  OptionWrapper,
  OptionsCategoryWrapper,
} from './elements';
import { OptionsCategoryProps } from './types';

export const OptionsCategory: React.FC<
  OptionsCategoryProps<MultiSelectOptionType>
> = React.memo(({ category, options, selectedOptions, onValueChange }) => {
  const selectionMap = toBooleanMap(
    (selectedOptions || []).map((option) => {
      if (typeof option === 'string') {
        return option;
      }

      if (option?.value && typeof option?.value === 'string') {
        return option.value;
      }

      return option.label;
    })
  );

  const handleChangeCategory = (isSelected: boolean) => {
    onValueChange({
      category,
      options: isSelected ? options : undefined,
    });
  };

  const handleChangeOption = (
    option: OptionType<MultiSelectOptionType>,
    isSelected: boolean
  ) => {
    const updatedSelectedOptions = isSelected
      ? [...(selectedOptions || []), option]
      : (selectedOptions || []).filter((selectedOption) => {
          if (typeof selectedOption === 'string') {
            return selectedOption !== option.value;
          }

          return selectedOption?.value
            ? selectedOption?.value !== option.value
            : selectedOption?.label !== option.label;
        });

    onValueChange({
      category,
      options: updatedSelectedOptions.length
        ? updatedSelectedOptions
        : undefined,
    });
  };

  const isAnySelected = !isEmpty(selectedOptions);
  const isAllSelected =
    (selectedOptions && selectedOptions.length) === options?.length;

  return (
    <OptionsCategoryWrapper>
      <CategoryWrapper>
        <Checkbox
          name={category}
          indeterminate={isAnySelected && !isAllSelected}
          checked={isAllSelected || isAnySelected}
          onChange={handleChangeCategory}
        >
          {category}
        </Checkbox>
      </CategoryWrapper>

      {(options || []).map((option) => {
        const { label } = option;
        const name = `${category}-${label}`;

        return (
          <OptionWrapper key={name}>
            <Checkbox
              name={name}
              checked={Boolean(selectionMap[label])}
              onChange={(isSelected: boolean) =>
                handleChangeOption(option, isSelected)
              }
            >
              {label}
            </Checkbox>
          </OptionWrapper>
        );
      })}
    </OptionsCategoryWrapper>
  );
});

import React from 'react';

import { OptionType } from '@cognite/cogs.js';

import { MultiSelectOptionType } from '../MultiSelect/types';

import { OptionsCategoryProps } from './types';
import { DropdownIndentOptions } from './views/DropdownIndentOptions';
import { DropdownMenuOptions } from './views/DropdownMenuOptions';

export const OptionsCategory: React.FC<
  OptionsCategoryProps<MultiSelectOptionType>
> = React.memo(
  ({
    category,
    options,
    selectedOptions,
    renderCategoryHelpText,
    onValueChange,
    viewMode,
  }) => {
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

    if (viewMode === 'submenu') {
      return (
        <DropdownMenuOptions
          options={options}
          category={category}
          selectedOptions={selectedOptions}
          onChangeOption={handleChangeOption}
          onChangeCategory={handleChangeCategory}
          renderCategoryHelpText={renderCategoryHelpText}
        />
      );
    }

    return (
      <DropdownIndentOptions
        options={options}
        category={category}
        selectedOptions={selectedOptions}
        onChangeOption={handleChangeOption}
        onChangeCategory={handleChangeCategory}
      />
    );
  }
);

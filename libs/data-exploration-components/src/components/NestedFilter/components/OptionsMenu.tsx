import * as React from 'react';

import { Dropdown, Menu } from '@cognite/cogs.js';

import { EMPTY_ARRAY } from '@data-exploration-lib/core';

import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import has from 'lodash/has';

import { OptionType, NestedFilterSelection, SortDirection } from '../types';

import { filterOptions } from '../utils/filterOptions';
import { sortOptions } from '../utils/sortOptions';
import { hasOptionWithChildOptions } from '../utils/hasOptionWithChildOptions';

import { SearchInput } from './SearchInput';
import { Option } from './Option';
import { ChildOptionsMenu } from './ChildOptionsMenu';
import { FilterEmptyState } from './FilterEmptyState';
import { SortAction } from './SortAction';

export interface OptionsMenuProps {
  options: Array<OptionType>;
  selection: NestedFilterSelection;
  onChange: (selection: NestedFilterSelection) => void;
  footer?: React.ReactNode;
  enableSorting?: boolean;
}

export const OptionsMenu: React.FC<OptionsMenuProps> = ({
  options,
  selection,
  onChange,
  footer,
  enableSorting,
}) => {
  const [displayOptions, setDisplayOptions] = React.useState(options);

  const handleFilterOptions = (searchInputValue: string) => {
    const filteredOptions = filterOptions(options, searchInputValue);
    setDisplayOptions(filteredOptions);
  };

  const handleSortOptions = (sortDirection: SortDirection) => {
    const sortedOptions = sortOptions(displayOptions, sortDirection);
    setDisplayOptions(sortedOptions);
  };

  const handleOptionChange = (value: string, isSelected: boolean) => {
    const newSelection = isSelected
      ? { ...selection, [value]: EMPTY_ARRAY }
      : omit(selection, value);

    onChange(newSelection);
  };

  const renderOptions = () => {
    if (isEmpty(displayOptions)) {
      return <FilterEmptyState />;
    }

    return displayOptions.map((option) => {
      const { value, options: childOptions } = option;

      return (
        <Dropdown
          key={option.value}
          placement="right-start"
          openOnHover
          content={
            <ChildOptionsMenu
              parentOptionValue={value}
              options={childOptions}
              selection={selection}
              onChange={onChange}
              enableSorting={enableSorting}
            />
          }
        >
          <Option
            option={option}
            checked={has(selection, value)}
            indeterminate={!isEmpty(selection[value])}
            onChange={(isSelected) => handleOptionChange(value, isSelected)}
            hasOptionWithChildOptions={hasOptionWithChildOptions(options)}
          />
        </Dropdown>
      );
    });
  };

  return (
    <Menu>
      <SearchInput onChange={handleFilterOptions} />

      <SortAction
        isVisible={enableSorting && !isEmpty(displayOptions)}
        onChange={handleSortOptions}
      />

      {renderOptions()}

      {footer}
    </Menu>
  );
};

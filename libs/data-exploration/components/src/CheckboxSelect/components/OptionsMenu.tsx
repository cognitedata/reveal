import { useState } from 'react';

import {
  EMPTY_ARRAY,
  NIL_FILTER_LABEL,
  isEscapeButton,
  useDeepEffect,
} from '@data-exploration-lib/core';
import has from 'lodash/has';
import isEmpty from 'lodash/isEmpty';
import noop from 'lodash/noop';
import omit from 'lodash/omit';

import { Body, Dropdown, Icon, Title } from '@cognite/cogs.js';

import {
  OptionContainer,
  OptionMenuContainer,
  OptionMenuLoadingWrapper,
} from '../elements';
import {
  OptionType,
  OptionSelection,
  SortDirection,
  CustomMetadataValue,
} from '../types';
import { filterOptions } from '../utils/filterOptions';
import { hasOptionWithChildOptions } from '../utils/hasOptionWithChildOptions';
import { sortOptions } from '../utils/sortOptions';

import { ChildOptionsMenu } from './ChildOptionsMenu';
import { FilterEmptyState } from './FilterEmptyState';
import { Option } from './Option';
import { SearchInput } from './SearchInput';
import { SortAction } from './SortAction';

export interface OptionsMenuProps {
  options: Array<OptionType>;
  selection: OptionSelection;
  onChange: (selection: OptionSelection) => void;
  footer?: React.ReactNode;
  enableSorting?: boolean;
  useCustomMetadataValuesQuery?: CustomMetadataValue;
  onCloseMenu?: () => void;
  onSearchInputChange?: (newValue: string) => void;
  disableOptionsMenu?: boolean;
  isLoading?: boolean;
}

export const OptionsMenu = ({
  options,
  selection,
  onChange,
  footer,
  enableSorting,
  onSearchInputChange,
  onCloseMenu = noop,
  useCustomMetadataValuesQuery,
  disableOptionsMenu,
  isLoading,
}: OptionsMenuProps) => {
  const [displayOptions, setDisplayOptions] = useState(options);

  const [hoverOption, setHoverOption] = useState<OptionType>();

  useDeepEffect(() => {
    setDisplayOptions(options);
  }, [options]);

  const onKeyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isEscapeButton(event.key)) {
      onCloseMenu();
    }
  };

  const handleFilterOptions = (searchInputValue: string) => {
    onSearchInputChange?.(searchInputValue);
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

    return displayOptions.map((option, index) => {
      const { options: childOptions } = option;
      let { value } = option;

      if (!value) {
        value = NIL_FILTER_LABEL;
      }

      return (
        <Dropdown
          key={`${option.value}_${index}`}
          placement="right-start"
          visible={hoverOption && hoverOption?.value === option.value}
          onClickOutside={() => {
            setHoverOption(undefined);
          }}
          content={
            <ChildOptionsMenu
              parentOptionValue={value}
              options={childOptions}
              useCustomMetadataValuesQuery={useCustomMetadataValuesQuery}
              selection={selection}
              onChange={onChange}
              enableSorting={enableSorting}
              onCloseMenu={onCloseMenu}
            />
          }
          disabled={disableOptionsMenu}
        >
          <Option
            onMouseEnter={() => {
              setHoverOption(option);
            }}
            onMouseLeave={() => {
              setHoverOption(undefined);
            }}
            option={option}
            checked={has(selection, value)}
            indeterminate={!isEmpty(selection[value])}
            onChange={(isSelected) => handleOptionChange(value, isSelected)}
            hasOptionWithChildOptions={hasOptionWithChildOptions(
              options,
              useCustomMetadataValuesQuery
            )}
          />
        </Dropdown>
      );
    });
  };

  if (isLoading) {
    return (
      <OptionMenuContainer>
        <OptionMenuLoadingWrapper>
          <Icon size={21} type="Loader" />
          <Title level={5}>Loading...</Title>
          <Body level={3}>Amount of data might affect loading time</Body>
        </OptionMenuLoadingWrapper>
      </OptionMenuContainer>
    );
  }

  return (
    <OptionMenuContainer>
      <SearchInput
        onChange={handleFilterOptions}
        onKeyDown={onKeyDownHandler}
      />

      <SortAction
        isVisible={enableSorting && !isEmpty(displayOptions)}
        onChange={handleSortOptions}
      />

      <OptionContainer>{renderOptions()}</OptionContainer>

      {footer}
    </OptionMenuContainer>
  );
};

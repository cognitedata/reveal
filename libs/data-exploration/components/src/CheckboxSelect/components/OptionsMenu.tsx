import { useState } from 'react';

import has from 'lodash/has';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import noop from 'lodash/noop';
import omit from 'lodash/omit';

import { Body, Dropdown, Icon, Title, DropdownProps } from '@cognite/cogs.js';

import {
  EMPTY_ARRAY,
  EMPTY_LABEL,
  isEscapeButton,
  useDeepEffect,
  useTranslation,
} from '@data-exploration-lib/core';

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
  placement?: DropdownProps['placement'];
  submenuOpenDelay?: number;
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
  placement = 'right-start',
  submenuOpenDelay,
}: OptionsMenuProps) => {
  const { t } = useTranslation();

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
      const { value = EMPTY_LABEL } = option;

      let openChildOptionsMenuTimeout: NodeJS.Timeout;

      return (
        <Dropdown
          key={`${option.value}_${index}`}
          placement={placement}
          visible={hoverOption?.value === option.value}
          onClickOutside={() => {
            setHoverOption(undefined);
          }}
          content={
            <ChildOptionsMenu
              parentOptionValue={value}
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
              if (isUndefined(submenuOpenDelay)) {
                setHoverOption(option);
              } else {
                openChildOptionsMenuTimeout = setTimeout(() => {
                  setHoverOption(option);
                }, submenuOpenDelay);
              }
            }}
            onMouseLeave={() => {
              setHoverOption(undefined);
              if (openChildOptionsMenuTimeout) {
                clearTimeout(openChildOptionsMenuTimeout);
              }
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
          <Title level={5}>{t('LOADING', 'Loading...')}</Title>
          <Body level={3}>
            {t(
              'LOADING_TIME_WARNING',
              'Amount of data might affect loading time'
            )}
          </Body>
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

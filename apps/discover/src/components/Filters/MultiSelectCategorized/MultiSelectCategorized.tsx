import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import unset from 'lodash/unset';

import { Title, Checkbox, Dropdown, Icon, OptionType } from '@cognite/cogs.js';

import { useDeepMemo } from 'hooks/useDeep';

import { MultiSelectOptionType } from '../MultiSelect/types';

import {
  DEFAULT_PLACEHOLDER,
  DEFAULT_SELECT_ALL_LABEL,
  NO_OPTIONS_TEXT,
} from './constants';
import {
  CategoryWrapper,
  DropdownContent,
  DropdownLabel,
  DropdownValue,
  MultiSelectCategorizedWrapper,
  NoOptionsWrapper,
} from './elements';
import { OptionsCategory } from './OptionsCategory';
import {
  CategorizedOptionType,
  Category,
  MultiSelectCategorizedProps,
} from './types';
import { getMultiSelectCategorizedOptions, getProcessedOptions } from './utils';

export const MultiSelectCategorized: React.FC<MultiSelectCategorizedProps> = ({
  iconInsteadText,
  options: data,
  selectedOptions: selectedOptionsProp,
  title,
  placeholder,
  renderCategoryHelpText,
  onValueChange,
  enableSelectAll = true,
  selectAllLabel = DEFAULT_SELECT_ALL_LABEL,
  extraLabels = {},
  width,
  viewMode,
  boldTitle,
}) => {
  const multiSelectCategorizedRef = useRef<HTMLElement>(null);

  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  const [selectedOptions, setSelectedOptions] = useState<
    Record<Category, OptionType<MultiSelectOptionType>[] | undefined>
  >({});

  useEffect(() => {
    if (!selectedOptionsProp) return;

    const multiSelectCategorizedOptions =
      getMultiSelectCategorizedOptions(selectedOptionsProp);

    const selectedOptions = multiSelectCategorizedOptions.reduce(
      (selectedOptions, { category, options }) => ({
        ...selectedOptions,
        [category]: options,
      }),
      {}
    );

    setSelectedOptions(selectedOptions);
  }, [selectedOptionsProp]);

  const options = useDeepMemo(() => {
    const adaptedData = getMultiSelectCategorizedOptions(data);
    return getProcessedOptions(adaptedData, extraLabels);
  }, [data, extraLabels]);

  const optionsCount = useMemo(() => {
    return options.reduce(
      (total, { options }) => total + (options?.length || 1),
      0
    );
  }, [options]);

  const selectedOptionsCount = useMemo(() => {
    return Object.keys(selectedOptions).reduce(
      (previousValue, currentValue) => {
        return previousValue + (selectedOptions[currentValue]?.length || 1);
      },
      0
    );
  }, [selectedOptions]);

  const handleSetSelectedOptions = useCallback(
    (
      selectedOptions: Record<
        Category,
        OptionType<MultiSelectOptionType>[] | undefined
      >
    ) => {
      if (!selectedOptionsProp) {
        setSelectedOptions(selectedOptions);
      }
      onValueChange(selectedOptions);
    },
    [setSelectedOptions, onValueChange, selectedOptionsProp]
  );

  const handleValueChange = useCallback(
    ({ category, options }: CategorizedOptionType<MultiSelectOptionType>) => {
      const updatedSelectedOptions = {
        ...selectedOptions,
        [category]: options,
      };

      if (isUndefined(options)) {
        unset(updatedSelectedOptions, category);
      }

      handleSetSelectedOptions(updatedSelectedOptions);
    },
    [handleSetSelectedOptions, selectedOptions]
  );

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      handleSetSelectedOptions(
        options.reduce(
          (selectedOptions, { category, options }) => ({
            ...selectedOptions,
            [category]: options,
          }),
          {}
        )
      );
    } else {
      handleSetSelectedOptions({});
    }
  };

  const isAnySelected = !isEmpty(selectedOptions);
  const isAllSelected = selectedOptionsCount === optionsCount;

  const SelectAllOption = useDeepMemo(() => {
    if (!enableSelectAll || isEmpty(options)) {
      return null;
    }
    return (
      <CategoryWrapper>
        <Checkbox
          name={selectAllLabel}
          indeterminate={isAnySelected && !isAllSelected}
          checked={isAllSelected || isAnySelected}
          onChange={handleSelectAll}
        >
          {selectAllLabel}
        </Checkbox>
      </CategoryWrapper>
    );
  }, [selectedOptions]);

  const OptionsContent = useMemo(
    () => (
      <>
        {SelectAllOption}
        {options.map(({ category, options }) => {
          return (
            <OptionsCategory
              key={category}
              category={category}
              options={options}
              viewMode={viewMode}
              selectedOptions={selectedOptions[category]}
              onValueChange={handleValueChange}
              renderCategoryHelpText={renderCategoryHelpText}
            />
          );
        })}
      </>
    ),
    [
      SelectAllOption,
      handleValueChange,
      options,
      selectedOptions,
      viewMode,
      renderCategoryHelpText,
    ]
  );

  const NoOptionsContent = useMemo(
    () => <NoOptionsWrapper>{NO_OPTIONS_TEXT}</NoOptionsWrapper>,
    []
  );

  const dropdownContent = useMemo(
    () => (
      <DropdownContent width={width}>
        {optionsCount ? OptionsContent : NoOptionsContent}
      </DropdownContent>
    ),
    [optionsCount, NoOptionsContent, OptionsContent]
  );

  const dropdownIcon = useMemo(
    () => (dropdownVisible ? 'ChevronUp' : 'ChevronDown'),
    [dropdownVisible]
  );

  const dropdownValue = useDeepMemo(() => {
    if (isAnySelected) {
      return `${selectedOptionsCount}/${optionsCount}`;
    }
    return placeholder || DEFAULT_PLACEHOLDER;
  }, [isAnySelected, selectedOptionsCount]);

  return (
    <MultiSelectCategorizedWrapper
      data-testid="multi-select-categorized-wrapper"
      ref={multiSelectCategorizedRef}
      width={width}
    >
      <Dropdown
        appendTo={document.body}
        content={dropdownContent}
        visible={dropdownVisible}
        onClickOutside={() => setDropdownVisible(false)}
      >
        <DropdownLabel
          variant="unknown"
          icon={!iconInsteadText && dropdownIcon} // Use provided icon if passed
          iconPlacement="right"
          $focused={dropdownVisible}
          onClick={() => setDropdownVisible((prevState) => !prevState)}
          bold={boldTitle}
        >
          {iconInsteadText ? (
            <Icon type={iconInsteadText} />
          ) : (
            <>
              <Title level={6}>{title}:</Title>
              <DropdownValue $placeholder={!isAnySelected}>
                {dropdownValue}
              </DropdownValue>
            </>
          )}
        </DropdownLabel>
      </Dropdown>
    </MultiSelectCategorizedWrapper>
  );
};

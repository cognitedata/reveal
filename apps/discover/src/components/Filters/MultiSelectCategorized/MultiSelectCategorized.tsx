import React, { useEffect, useMemo, useRef, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import unset from 'lodash/unset';

import { Body, Checkbox, Dropdown, OptionType } from '@cognite/cogs.js';

import { useDeepMemo } from 'hooks/useDeep';

import { MultiSelectOptionType } from '../MultiSelect/types';

import {
  DEFAULT_PLACEHOLDER,
  DEFAULT_SELECT_ALL_LABEL,
  NO_OPTIONS_TEXT,
  SELECTED_ALL_DISPLAY_VALUE,
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
  options: data,
  selectedOptions: selectedOptionsProp,
  title,
  placeholder,
  onValueChange,
  enableSelectAll = true,
  selectAllLabel = DEFAULT_SELECT_ALL_LABEL,
  extraLabels = {},
  width,
}) => {
  const multiSelectCategorizedRef = useRef<HTMLElement>(null);

  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  const [selectedOptions, setSelectedOptions] = useState<
    Record<Category, OptionType<MultiSelectOptionType>[] | undefined>
  >({});

  useEffect(() => {
    if (!selectedOptionsProp) return;

    setSelectedOptions(
      getMultiSelectCategorizedOptions(selectedOptionsProp).reduce(
        (selectedOptions, { category, options }) => ({
          ...selectedOptions,
          [category]: options,
        }),
        {}
      )
    );
  }, [selectedOptionsProp]);

  const options = useDeepMemo(() => {
    const adaptedData = getMultiSelectCategorizedOptions(data);
    return getProcessedOptions(adaptedData, extraLabels);
  }, [data, extraLabels]);

  const optionsCount = options.reduce(
    (total, { options }) => total + (options?.length || 1),
    0
  );

  const handleSetSelectedOptions = (
    selectedOptions: Record<
      Category,
      OptionType<MultiSelectOptionType>[] | undefined
    >
  ) => {
    if (!selectedOptionsProp) {
      setSelectedOptions(selectedOptions);
    }
    onValueChange(selectedOptions);
  };

  const handleValueChange = ({
    category,
    options,
  }: CategorizedOptionType<MultiSelectOptionType>) => {
    const updatedSelectedOptions = {
      ...selectedOptions,
      [category]: options,
    };

    if (isUndefined(options)) {
      unset(updatedSelectedOptions, category);
    }

    handleSetSelectedOptions(updatedSelectedOptions);
  };

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

  /**
   * Takes the width passed in props or,
   * takes the full width available.
   */
  const dropdownWidth = width || multiSelectCategorizedRef.current?.clientWidth;

  const selectedOptionValues = Object.keys(selectedOptions || {});
  const isAnySelected = !isEmpty(selectedOptions);
  const isAllSelected = selectedOptionValues.length === optionsCount;

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

  const OptionsContent = (
    <>
      {SelectAllOption}
      {options.map(({ category, options }) => {
        return (
          <OptionsCategory
            key={category}
            category={category}
            options={options}
            selectedOptions={selectedOptions[category]}
            onValueChange={handleValueChange}
          />
        );
      })}
    </>
  );

  const NoOptionsContent = (
    <NoOptionsWrapper>{NO_OPTIONS_TEXT}</NoOptionsWrapper>
  );

  const dropdownContent = useMemo(
    () => (
      <DropdownContent width={dropdownWidth}>
        {isEmpty(options) ? NoOptionsContent : OptionsContent}
      </DropdownContent>
    ),
    [
      options.length,
      selectedOptionValues.length,
      selectedOptions,
      dropdownWidth,
    ]
  );

  const dropdownIcon = useMemo(
    () => (dropdownVisible ? 'ChevronUp' : 'ChevronDown'),
    [dropdownVisible]
  );

  const dropdownValue = useDeepMemo(() => {
    if (isAllSelected) {
      return SELECTED_ALL_DISPLAY_VALUE;
    }
    if (isAnySelected) {
      return `${selectedOptionValues.length}/${optionsCount}`;
    }
    return placeholder || DEFAULT_PLACEHOLDER;
  }, [isAnySelected, selectedOptionValues]);

  return (
    <MultiSelectCategorizedWrapper
      ref={multiSelectCategorizedRef}
      width={dropdownWidth}
    >
      <Dropdown
        appendTo={document.body}
        content={dropdownContent}
        visible={dropdownVisible}
        onClickOutside={() => setDropdownVisible(false)}
      >
        <DropdownLabel
          variant="unknown"
          icon={dropdownIcon}
          iconPlacement="right"
          $focused={dropdownVisible}
          onClick={() => setDropdownVisible((prevState) => !prevState)}
        >
          <Body level={2} strong>
            {title}:
          </Body>
          <DropdownValue $placeholder={!isAnySelected}>
            {dropdownValue}
          </DropdownValue>
        </DropdownLabel>
      </Dropdown>
    </MultiSelectCategorizedWrapper>
  );
};

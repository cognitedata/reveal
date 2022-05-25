import React, { useMemo, useRef, useState } from 'react';

import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import unset from 'lodash/unset';

import { Body, Checkbox, Dropdown, OptionType } from '@cognite/cogs.js';

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
import { getProcessedOptions } from './utils';

export const MultiSelectCategorized: React.FC<MultiSelectCategorizedProps> = ({
  options: data = [],
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
    Record<Category, OptionType<MultiSelectOptionType>[]>
  >({});

  const options = useDeepMemo(
    () => getProcessedOptions(data, extraLabels),
    [data, extraLabels]
  );

  const optionsCount = options.reduce(
    (total, { options }) => total + options.length,
    0
  );

  const handleValueChange = ({
    category,
    options,
  }: CategorizedOptionType<MultiSelectOptionType>) => {
    const updatedSelectedOptions = {
      ...selectedOptions,
      [category]: options,
    };

    if (isEmpty(options)) {
      unset(updatedSelectedOptions, category);
    }

    const labels = flatten(Object.values(updatedSelectedOptions)).map(
      (option) => option.label
    );

    setSelectedOptions(updatedSelectedOptions);
    onValueChange(labels);
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedOptions(
        options.reduce(
          (selectedOptions, { category, options }) => ({
            ...selectedOptions,
            [category]: options,
          }),
          {}
        )
      );
    } else {
      setSelectedOptions({});
    }
  };

  /**
   * Takes the width passed in props or,
   * takes the full width available.
   */
  const dropdownWidth = width || multiSelectCategorizedRef.current?.clientWidth;

  const selectedOptionValues = flatten(Object.values(selectedOptions));
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
    [options.length, selectedOptionValues.length, dropdownWidth]
  );

  const dropdownIcon = useMemo(
    () => (dropdownVisible ? 'ChevronUp' : 'ChevronDown'),
    [dropdownVisible]
  );

  const dropdownValue = useDeepMemo(
    () =>
      isAnySelected
        ? `${selectedOptionValues.length}/${optionsCount}`
        : placeholder || DEFAULT_PLACEHOLDER,
    [isAnySelected, selectedOptionValues]
  );

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

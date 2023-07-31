import React, { useState } from 'react';

import flatten from 'lodash/flatten';
import isArray from 'lodash/isArray';

import { OptionType, Select } from '@cognite/cogs.js';

import EmptyState from 'components/EmptyState';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import { adaptOptionsToFilter } from '../utils/adaptOptionsToFilter';

import { DropdownWrapper } from './elements';

export interface CommonCurveFilterProps {
  title: string;
  options: string[] | Record<string, string[]>;
  onChange: (selectedOptions: string[]) => void;
}

const renderEmpty = () => (
  <EmptyState emptySubtitle="Sorry, but we couldn’t find anything based on your search" />
);

const getValuesFromOptionTypes = (optionsTypes: OptionType<string[]>[]) => {
  return optionsTypes.flatMap(({ value }) => value!);
};

export const CommonCurveFilter: React.FC<CommonCurveFilterProps> = ({
  title,
  options,
  onChange,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<
    OptionType<string[]>[]
  >([]);

  const adaptedOptions = useDeepMemo(
    () => adaptOptionsToFilter(options),
    [options]
  );

  const totalOptionsCount = isArray(options)
    ? options.length
    : flatten(Object.values(options)).length;

  const selectedOptionsCount = getValuesFromOptionTypes(selectedOptions).length;

  const handleChange = (optionTypes: OptionType<string[]>[]) => {
    setSelectedOptions(optionTypes);
    onChange(getValuesFromOptionTypes(optionTypes));
  };

  useDeepEffect(() => {
    setSelectedOptions(adaptedOptions);
  }, [adaptedOptions]);

  return (
    <DropdownWrapper>
      <Select<string[]>
        isMulti
        title={`${title}:`}
        selectAllLabel="All"
        placeholder="Search"
        value={selectedOptions}
        onChange={handleChange}
        options={adaptedOptions}
        enableSelectAll={Boolean(totalOptionsCount)}
        disableTyping
        showCheckbox
        placeholderSelectElement={`${selectedOptionsCount} / ${totalOptionsCount}`}
        noOptionsMessage={renderEmpty}
      />
    </DropdownWrapper>
  );
};

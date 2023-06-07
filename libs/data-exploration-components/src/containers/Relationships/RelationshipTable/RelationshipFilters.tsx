import React from 'react';
import { OptionsType, OptionTypeBase } from 'react-select';

import styled from 'styled-components';

import { MultiSelect } from '@data-exploration-components/components';
import { RelationshipTypeLabels } from '@data-exploration-components/hooks';

interface RelationshipFiltersProps {
  options: string[];
  onChange: (labels?: string[]) => void;
  value?: RelationshipTypeLabels;
}
export function RelationshipFilters({
  options,
  onChange,
  value,
}: RelationshipFiltersProps) {
  return (
    <SelectWrapper>
      <MultiSelect
        options={options.map((option) => ({
          label: option,
          value: option,
        }))}
        title="Labels:"
        onChange={(newValue) => {
          onChange(
            newValue
              ? (newValue as OptionsType<OptionTypeBase>).map((el) => el.value)
              : undefined
          );
        }}
        value={value?.map((el) => ({
          label: el.externalId,
          value: el.externalId,
        }))}
        isMulti
        isSearchable
        isClearable
      />
    </SelectWrapper>
  );
}

const SelectWrapper = styled.div`
  width: 225px;
`;

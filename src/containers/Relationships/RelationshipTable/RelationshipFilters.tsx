import { Flex } from '@cognite/cogs.js';
import React from 'react';
import { Select } from 'components';
import { OptionsType, OptionTypeBase } from 'react-select';
import styled from 'styled-components';
import { RelationshipTypeLabels } from 'hooks';

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
    <Flex alignItems="center">
      <h4>Relationship Labels:</h4>
      <SelectWrapper>
        <Select
          creatable
          options={options.map(option => ({
            label: option,
            value: option,
          }))}
          onChange={newValue => {
            onChange(
              newValue
                ? (newValue as OptionsType<OptionTypeBase>).map(el => el.value)
                : undefined
            );
          }}
          value={value?.map(el => ({
            label: el.externalId,
            value: el.externalId,
          }))}
          isMulti
          isSearchable
          isClearable
        />
      </SelectWrapper>
    </Flex>
  );
}

const SelectWrapper = styled.div`
  width: 225px;
  margin: 20px;
`;

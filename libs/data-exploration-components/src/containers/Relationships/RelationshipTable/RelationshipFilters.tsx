import React from 'react';
import { OptionsType, OptionTypeBase } from 'react-select';

import styled from 'styled-components';

import { MultiSelect } from '@data-exploration/components';
import { RelationshipTypeLabels } from '@data-exploration-components/hooks';

import { useTranslation } from '@data-exploration-lib/core';

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
  const { t } = useTranslation();

  return (
    <SelectWrapper>
      <MultiSelect
        options={options.map((option) => ({
          label: option,
          value: option,
        }))}
        title={`${t('LABELS', 'Labels')}:`}
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

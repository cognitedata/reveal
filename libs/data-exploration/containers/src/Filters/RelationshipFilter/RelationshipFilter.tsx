import React from 'react';
import { OptionsType, OptionTypeBase } from 'react-select';

import styled from 'styled-components';

import { MultiSelect } from '@data-exploration/components';

import { useTranslation } from '@data-exploration-lib/core';

interface RelationshipFilterProps {
  options: string[];
  onChange: (labels?: string[]) => void;
  value?: string[];
}
export function RelationshipFilter({
  options,
  onChange,
  value,
}: RelationshipFilterProps) {
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
          label: el,
          value: el,
        }))}
        isMulti
        isSearchable
        isClearable
      />
    </SelectWrapper>
  );
}

const SelectWrapper = styled.div`
  .cogs-select__multi-value {
    max-width: 120px;
  }
  width: 250px;
`;

import React from 'react';

import styled from 'styled-components';

import isArray from 'lodash/isArray';
import isEqual from 'lodash/isEqual';

import { Flex, IconType } from '@cognite/cogs.js';

import { InternalFilters, useTranslation } from '@data-exploration-lib/core';

import { FilterChip } from './FilterChip';
import { formatValue } from './utils';

export interface AppliedFiltersTagsProps {
  filter: InternalFilters;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
  icon?: IconType;
}

export const AppliedFiltersTags: React.FC<AppliedFiltersTagsProps> = ({
  filter,
  onFilterChange,
  icon,
}) => {
  const { t } = useTranslation();
  const filterKeys = Object.keys(
    filter || {}
  ) as unknown as (keyof InternalFilters)[];

  return (
    <Container>
      {filterKeys.map((key) => {
        const filterValues = filter[key];

        if (filterValues === undefined) {
          return null;
        }

        if (isArray(filterValues)) {
          return filterValues.map((value) => {
            const displayValue = formatValue(value, t);

            return (
              <FilterChip
                key={`${key}-${displayValue}`}
                name={key}
                icon={icon}
                value={displayValue}
                onClick={() => {
                  const filtered = (filterValues as any[]).filter(
                    (item) => !isEqual(item, value)
                  );
                  onFilterChange?.({ [key]: filtered });
                }}
              />
            );
          });
        }

        const displayValue = formatValue(filterValues, t);
        return (
          <FilterChip
            key={`${key}-${displayValue}`}
            name={key}
            icon={icon}
            value={displayValue}
            onClick={() => {
              onFilterChange?.({ [key]: undefined });
            }}
          />
        );
      })}
    </Container>
  );
};

const Container = styled(Flex)`
  gap: 8px;
  flex-flow: wrap;
`;

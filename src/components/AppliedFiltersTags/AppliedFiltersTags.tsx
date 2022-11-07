import { Flex } from '@cognite/cogs.js';
import { isArray, isEqual } from 'lodash';
import React from 'react';
import styled from 'styled-components';
import { NewFiltersType } from 'types';
import { FilterChip } from './FilterChip';
import { formatValue } from './utils';

interface Props {
  filter: NewFiltersType;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
}

export const AppliedFiltersTags: React.FC<Props> = ({
  filter,
  onFilterChange,
}) => {
  const filterKeys = Object.keys(
    filter || {}
  ) as unknown as (keyof NewFiltersType)[];

  return (
    <Container>
      {filterKeys.map(key => {
        const filterValues = filter[key];

        if (isArray(filterValues)) {
          return filterValues.map(value => {
            const displayValue = formatValue(value);

            return (
              <FilterChip
                key={`${key}-${value}-${displayValue}`}
                name={key}
                value={displayValue}
                onClick={() => {
                  if (!onFilterChange) {
                    return undefined;
                  }

                  const filtered = filterValues.filter(
                    item => !isEqual(item, value)
                  );
                  onFilterChange({ [key]: filtered });
                }}
              />
            );
          });
        }

        const displayValue = formatValue(filterValues);
        return (
          <FilterChip
            key={`${key}-${displayValue}`}
            name={key}
            value={displayValue}
            onClick={() => {
              if (!onFilterChange) {
                return undefined;
              }
              onFilterChange({ [key]: undefined });
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

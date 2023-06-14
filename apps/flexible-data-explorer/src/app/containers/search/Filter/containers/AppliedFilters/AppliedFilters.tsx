import * as React from 'react';

import styled from 'styled-components/macro';

import { Chip, ChipGroup } from '@cognite/cogs.js';

import { ValueByDataType } from '../../types';
import { removeFilter } from '../../utils';

import { getChipLabel } from './utils';

export interface AppliedFiltersProps {
  value?: ValueByDataType;
  onRemove?: (value: ValueByDataType) => void;
}

export const AppliedFilters: React.FC<AppliedFiltersProps> = ({
  value = {},
  onRemove,
}) => {
  const handleRemove = (dataType: string, field: string) => {
    const newValue = removeFilter(value, { dataType, field });
    onRemove?.(newValue);
  };

  return (
    <Wrapper>
      <ChipGroup type="neutral" size="medium" overflow={2}>
        {Object.entries(value).map(([dataType, valueByField]) => {
          return Object.entries(valueByField).map(([field, fieldValue]) => {
            const label = getChipLabel({ dataType, field, fieldValue });

            return (
              <Chip
                key={label}
                type="neutral"
                label={label}
                onRemove={() => handleRemove(dataType, field)}
              />
            );
          });
        })}
      </ChipGroup>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  .cogs-chip-group__overflow {
    background: var(--cogs-surface--status-neutral--muted--default);
    color: var(--cogs-text-icon--status-neutral);
  }
`;

import isEmpty from 'lodash/isEmpty';
import styled from 'styled-components/macro';

import { ChipGroup } from '@cognite/cogs.js';

import { ValueByDataType, ValueByField } from '../../types';
import { isValueByField } from '../../utils';

import { AppliedFiltersByDataType } from './AppliedFiltersByDataType';
import { AppliedFiltersByField } from './AppliedFiltersByField';

export interface AppliedFiltersProps<T extends ValueByDataType | ValueByField> {
  value?: T;
  onRemove?: (value: T) => void;
}

export const AppliedFilters = <T extends ValueByDataType | ValueByField>({
  value,
  onRemove,
}: AppliedFiltersProps<T>) => {
  const renderAppliedFilters = () => {
    if (!value || isEmpty(value)) {
      return null;
    }

    if (isValueByField(value)) {
      return (
        <AppliedFiltersByField
          value={value}
          onRemove={(newValue) => onRemove?.(newValue as T)}
        />
      );
    }

    return (
      <AppliedFiltersByDataType
        value={value}
        onRemove={(newValue) => onRemove?.(newValue as T)}
      />
    );
  };

  return (
    <Wrapper>
      <ChipGroup type="neutral" size="medium" overflow={2}>
        {renderAppliedFilters()}
      </ChipGroup>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  .cogs-chip {
    background: var(--cogs-surface--status-neutral--muted--default);
    color: var(--cogs-text-icon--status-neutral);
  }
`;

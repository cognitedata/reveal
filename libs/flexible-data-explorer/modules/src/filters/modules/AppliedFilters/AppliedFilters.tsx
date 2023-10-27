import { ValueByDataType, ValueByField } from '@fdx/shared/types/filters';
import isEmpty from 'lodash/isEmpty';
import styled from 'styled-components/macro';

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
  if (!value || isEmpty(value)) {
    return null;
  }

  if (isValueByField(value)) {
    return (
      <Wrapper>
        <AppliedFiltersByField
          value={value}
          onRemove={(newValue) => onRemove?.(newValue as T)}
        />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <AppliedFiltersByDataType
        value={value}
        onRemove={(newValue) => onRemove?.(newValue as T)}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  .cogs-chip {
    background: var(--cogs-surface--status-neutral--muted--default);
    color: var(--cogs-text-icon--status-neutral);
  }
`;

import React from 'react';
import { Body, Button, Icon, IconType } from '@cognite/cogs.js';
import styled from 'styled-components';

import { ColumnProfile } from 'hooks/profiling-service';
import { ALL_FILTER } from 'hooks/table-filters';

export type FilterType = {
  type: ColumnProfile['type'] | typeof ALL_FILTER;
  value?: number;
  icon?: IconType;
  label?: string;
};

type Props = {
  filter: FilterType;
  active?: boolean;
  onClick: (filter: FilterType) => void;
};

export const FilterItem = ({ filter, active, onClick }: Props): JSX.Element => {
  const { type, value, icon, label } = filter;

  const isDisabled = !value;

  return (
    <Button
      type="tertiary"
      toggled={active && !isDisabled}
      disabled={isDisabled}
      onClick={() => onClick(filter)}
      style={{ padding: '8px' }}
    >
      {icon ? (
        <FilterContent level={2} strong>
          <Icon type={icon} css={{ marginRight: '8px' }} />
          {value ?? 0}
        </FilterContent>
      ) : (
        <FilterContent level={2} strong>
          {value ?? 0} {label ?? type}
        </FilterContent>
      )}
    </Button>
  );
};

const FilterContent = styled(Body)`
  color: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
`;

import React from 'react';
import { Body, Button } from '@cognite/cogs.js';
import styled from 'styled-components';

import { IconType } from 'assets/icons';
import { CustomIcon } from 'components/CustomIcon';
import { ColumnProfile } from 'hooks/profiling-service';

export type FilterType = {
  type: ColumnProfile['type'] | 'All';
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
  const { type, value, icon } = filter;

  return (
    <Button
      type="tertiary"
      toggled={active}
      onClick={() => onClick(filter)}
      style={{ padding: '8px' }}
    >
      {icon ? (
        <FilterContent level={2} strong>
          <CustomIcon icon={icon} style={{ marginRight: '8px' }} />
          {value}
        </FilterContent>
      ) : (
        <FilterContent level={2} strong>
          {value} {type}
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

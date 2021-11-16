import React from 'react';
import { AllIconTypes, Body, Button, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

export type FilterType = {
  type: string;
  value: number;
  icon?: AllIconTypes;
};

type Props = {
  filter: FilterType;
  active?: boolean;
  onClick: (filter: FilterType) => void;
};

export const FilterItem = ({ filter, active, onClick }: Props): JSX.Element => {
  const { type, value, icon } = filter;

  return (
    <Button type="tertiary" toggled={active} onClick={() => onClick(filter)}>
      {icon ? (
        <FilterContent level={2} strong>
          <Icon type={icon} style={{ marginRight: '8px' }} />
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

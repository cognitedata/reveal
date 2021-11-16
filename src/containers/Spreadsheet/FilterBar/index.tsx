import React from 'react';
import styled from 'styled-components';
import { Body, Button, Flex, Icon, Input } from '@cognite/cogs.js';

import { useTableData } from 'hooks/table-data';
import { FILTER_BAR_HEIGHT } from 'utils/constants';
import { Separator } from 'components/Separator';
import { Actions } from './Actions';

import { activeFilters } from './mock';

export type FilterType = { type: string; value: number };

type Props = { isEmpty?: boolean };
export const FilterBar = ({ isEmpty }: Props): JSX.Element => {
  const { rows, isDone } = useTableData();
  const tableLength = isDone ? (
    rows.length ?? 0
  ) : (
    <Icon type="LoadingSpinner" style={{ marginRight: '4px' }} />
  );

  const onFilterClick = (_filter: FilterType) => {
    /** do something */
  };

  return (
    <Bar justifyContent="space-between" alignItems="center">
      <FilterBar.List justifyContent="center" alignItems="center">
        {!isEmpty && (
          <>
            <Input placeholder="Search column name" />
            <Separator style={{ margin: '0 12px' }} />
            {activeFilters.map((filter: FilterType) => (
              <Button type="tertiary" onClick={() => onFilterClick(filter)}>
                {filter.value} {filter.type}
              </Button>
            ))}
          </>
        )}
      </FilterBar.List>
      <Flex justifyContent="center" alignItems="center">
        <Separator style={{ margin: '0 12px' }} />
        <Body
          level={2}
          strong
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {tableLength} rows
        </Body>
        <Separator style={{ margin: '0 12px' }} />
        <FilterBar.Actions />
      </Flex>
    </Bar>
  );
};

const Bar = styled(Flex)`
  padding: 16px;
  height: ${FILTER_BAR_HEIGHT}px;
  box-sizing: border-box;
`;

const List = styled(Flex)`
  & > :not(:first-child) {
    margin-right: 8px;
  }
`;

FilterBar.List = List;
FilterBar.Actions = Actions;

import React from 'react';
import styled from 'styled-components';
import { Body, Flex, Icon, Input } from '@cognite/cogs.js';

import { useTableData } from 'hooks/table-data';
import { useFilters } from 'hooks/table-filters';
import { FILTER_BAR_HEIGHT } from 'utils/constants';

import { Separator } from 'components/Separator';
import { FilterItem, FilterType } from 'components/FilterItem';
import { Actions } from './Actions';

type Props = { isEmpty?: boolean };
export const FilterBar = ({ isEmpty }: Props): JSX.Element => {
  const { rows, isDone } = useTableData();
  const { filters, activeFilters, setFilter } = useFilters();
  const tableLength = isDone ? (
    rows.length ?? 0
  ) : (
    <Icon type="LoadingSpinner" style={{ marginRight: '4px' }} />
  );

  const onFilterClick = (filter: FilterType) => {
    setFilter(filter.type);
  };

  return (
    <Bar justifyContent="space-between" alignItems="center">
      <FilterBar.List justifyContent="center" alignItems="center">
        {!isEmpty && (
          <>
            <Input placeholder="Search column name" />
            <Separator style={{ margin: '0 12px' }} />
            {filters.map((filter: FilterType) => {
              const active = activeFilters.includes(filter.type);
              return (
                <FilterItem
                  filter={filter}
                  active={active}
                  onClick={onFilterClick}
                />
              );
            })}
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

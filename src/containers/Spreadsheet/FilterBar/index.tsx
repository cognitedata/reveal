import React from 'react';
import styled from 'styled-components';
import { Body, Flex, Input } from '@cognite/cogs.js';

import { useFilters } from 'hooks/table-filters';
import { FILTER_BAR_HEIGHT } from 'utils/constants';

import { Separator } from 'components/Separator';
import { FilterItem, FilterType } from 'components/FilterItem';
import { Actions } from './Actions';
import RowCount from './RowCount';

type Props = {
  isEmpty?: boolean;
};

export const FilterBar = ({ isEmpty }: Props): JSX.Element => {
  const {
    filters,
    columnTypeFilters,
    setTypeFilter,
    columnNameFilter,
    setColumnNameFilter,
  } = useFilters();

  const onFilterClick = (filter: FilterType) => setTypeFilter(filter.type);
  const onColumnFilterChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setColumnNameFilter(e.target.value);

  return (
    <Bar justifyContent="space-between" alignItems="center">
      <FilterBar.List justifyContent="center" alignItems="center">
        {!isEmpty && (
          <>
            <Input
              placeholder="Search column name"
              value={columnNameFilter}
              onChange={onColumnFilterChange}
            />
            <Separator style={{ margin: '0 12px' }} />
            {filters.map((filter: FilterType) => {
              const active = columnTypeFilters.includes(filter.type);
              return (
                <FilterItem
                  key={`${filter.type}_${filter.value}`}
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
          <RowCount />
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

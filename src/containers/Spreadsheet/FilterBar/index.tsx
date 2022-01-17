import React from 'react';
import styled from 'styled-components';
import { Body, Colors, Flex, Icon, Input } from '@cognite/cogs.js';

import { useFilters } from 'hooks/table-filters';

import { FILTER_BAR_HEIGHT } from 'utils/constants';

import { Separator } from 'components/Separator';
import { FilterItem, FilterType } from 'components/FilterItem';
import { Actions } from './Actions';
import RowCount from './RowCount';
import TableLastUpdatedTime from './TableLastUpdatedTime';

type Props = {
  className?: string;
  isEmpty?: boolean;
  areTypesFetched?: boolean;
  hasActions?: boolean;
  isTableLastUpdatedTimeFetched?: boolean;
  tableLastUpdatedTime?: Date;
};

export const FilterBar = ({
  className,
  isEmpty,
  areTypesFetched,
  hasActions,
  isTableLastUpdatedTimeFetched,
  tableLastUpdatedTime,
}: Props): JSX.Element => {
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
    <Bar
      className={className}
      justifyContent="space-between"
      alignItems="center"
    >
      <FilterBar.List justifyContent="center" alignItems="center">
        <Input
          placeholder="Search column name"
          value={columnNameFilter}
          onChange={onColumnFilterChange}
          disabled={isEmpty}
        />
        <Separator style={{ margin: '0 12px' }} />
        <FilterBar.Buttons justifyContent="center" alignItems="center">
          {!areTypesFetched ? (
            <>
              <Body level={2}> Running data profiling...</Body>
              <Icon type="Loader" className="load-icon" />
            </>
          ) : (
            filters.map((filter: FilterType) => {
              const active = columnTypeFilters.includes(filter.type);
              return (
                <FilterItem
                  key={`${filter.type}_${filter.value}`}
                  filter={filter}
                  active={active}
                  onClick={onFilterClick}
                />
              );
            })
          )}
        </FilterBar.Buttons>
      </FilterBar.List>
      {hasActions && (
        <Flex justifyContent="center" alignItems="center">
          <TableLastUpdatedTime
            isTableLastUpdatedTimeFetched={isTableLastUpdatedTimeFetched}
            tableLastUpdatedTime={tableLastUpdatedTime}
          />
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
      )}
    </Bar>
  );
};

const Bar = styled(Flex)`
  width: 100%;
  height: ${FILTER_BAR_HEIGHT}px;
  padding: 16px;
  box-sizing: border-box;
  border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
`;

const List = styled(Flex)`
  & > :not(:first-child) {
    margin-right: 8px;
  }
`;

const Buttons = styled(Flex)`
  & > * {
    margin-right: 8px;
    color: ${Colors['greyscale-grey7'].hex()};
  }
  .load-icon {
    margin-left: 4px;
  }
`;

FilterBar.List = List;
FilterBar.Actions = Actions;
FilterBar.Buttons = Buttons;

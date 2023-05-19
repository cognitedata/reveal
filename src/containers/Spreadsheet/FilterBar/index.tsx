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
import { useTranslation } from 'common/i18n';

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
  const { t } = useTranslation();
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
          placeholder={t('spreadsheet-filter-search-placeholder')}
          value={columnNameFilter}
          onChange={onColumnFilterChange}
          disabled={isEmpty}
        />
        <Separator style={{ margin: '0 12px' }} />
        <FilterBar.Buttons justifyContent="center" alignItems="center">
          {!areTypesFetched ? (
            <>
              <Body level={2}>
                {t('spreadsheet-filter-buttons-running-profiling')}
              </Body>
              <Icon type="Loader" />
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
  border-bottom: 1px solid ${Colors['border--interactive--default']};
  white-space: nowrap;
`;

const List = styled(Flex)`
  & > :not(:first-child) {
    margin-right: 8px;
  }
`;

const Buttons = styled(Flex)`
  & > * {
    margin-right: 8px;
    color: ${Colors['text-icon--medium']};
  }
  .load-icon {
    margin-left: 4px;
  }
`;

FilterBar.List = List;
FilterBar.Actions = Actions;
FilterBar.Buttons = Buttons;

import { TableProps } from '@data-exploration/components';

import { Chart } from '@cognite/charts-lib';

import {
  DateRangeProps,
  InternalChartsFilters,
} from '@data-exploration-lib/core';

import { SearchResultCountLabel } from '../../Search/SearchResults/SearchResultCountLabel';
import { SearchResultToolbar } from '../../Search/SearchResults/SearchResultToolbar';

import { ChartsTable } from './ChartsTable';
import { useFilteredChartsData } from './hooks';
import { getQueriedChartsData } from './utils';

export const ChartsSearchResults = ({
  onClick,
  query = '',
  filter = { isPublic: undefined },
  id,
  ...rest
}: {
  onClick: (item: Chart) => void;
  query?: string;
  filter?: InternalChartsFilters;
  id?: string;
} & DateRangeProps &
  Omit<TableProps<Chart>, 'data' | 'columns' | 'id'>) => {
  const { data: chartsData, isChartsLoading } = useFilteredChartsData(filter);
  const data = getQueriedChartsData(chartsData, query);
  const count = data.length;

  return (
    <ChartsTable
      id={id || 'charts-search-results'}
      data={data}
      isDataLoading={isChartsLoading}
      onRowClick={(currentChart) => onClick(currentChart)}
      tableHeaders={
        <SearchResultToolbar
          showCount={true}
          resultCount={
            <SearchResultCountLabel
              loadedCount={count}
              totalCount={count}
              resourceType="charts"
            />
          }
        />
      }
      {...rest}
    />
  );
};

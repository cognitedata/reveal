import React, { useState } from 'react';

import {
  DefaultPreviewFilter,
  EmptyState,
  Table,
  getTableColumns,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';
import isEmpty from 'lodash/isEmpty';
import { useDebounce } from 'use-debounce';

import {
  InternalTimeseriesFilters,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  InternalTimeseriesData,
  TableSortBy,
  WithDetailViewData,
  useRelatedTimeseriesQuery,
} from '@data-exploration-lib/domain-layer';

import { AppliedFiltersTags } from '../AppliedFiltersTags';

import { TimeseriesTableFilters } from './TimeseriesTableFilters';

interface Props {
  resourceExternalId?: string;
  labels?: string[];
  onClick?: (item: WithDetailViewData<InternalTimeseriesData>) => void;
}

export const TimeseriesRelatedSearchResults: React.FC<Props> = ({
  resourceExternalId,
  labels,
  onClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [timeseriesFilter, setTimeseriesFilter] =
    useState<InternalTimeseriesFilters>({});
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const columns = [
    tableColumns.type(),
    tableColumns.relationshipLabels,
    tableColumns.relation,
    tableColumns.externalId(),
    tableColumns.lastUpdatedTime,
    tableColumns.created,
  ] as ColumnDef<WithDetailViewData<InternalTimeseriesData>>[];

  const { data, hasNextPage, fetchNextPage, isLoading } =
    useRelatedTimeseriesQuery({
      resourceExternalId,
      relationshipFilter: { labels },
      timeseriesFilter,
      query: debouncedQuery,
      sortBy,
    });

  const handleFilterChange = (newValue: InternalTimeseriesFilters) => {
    setTimeseriesFilter((prevState) => ({ ...prevState, ...newValue }));
  };

  if (isEmpty(data)) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <Table
      id="timeseries-related-search-results"
      enableSorting
      showLoadButton
      columns={columns}
      query={debouncedQuery}
      onRowClick={onClick}
      sorting={sortBy}
      onSort={setSortBy}
      data={data}
      hasNextPage={hasNextPage}
      fetchMore={fetchNextPage}
      tableSubHeaders={
        <AppliedFiltersTags
          filter={timeseriesFilter}
          onFilterChange={handleFilterChange}
        />
      }
      tableHeaders={
        <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
          <TimeseriesTableFilters
            filter={timeseriesFilter}
            onFilterChange={handleFilterChange}
          />
        </DefaultPreviewFilter>
      }
    />
  );
};

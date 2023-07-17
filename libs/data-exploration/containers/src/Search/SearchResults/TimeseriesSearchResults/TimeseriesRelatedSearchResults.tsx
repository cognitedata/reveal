import React, { useMemo, useState } from 'react';

import {
  DefaultPreviewFilter,
  EmptyState,
  Table,
  getTableColumns,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';
import isEmpty from 'lodash/isEmpty';
import { useDebounce } from 'use-debounce';

import { Asset } from '@cognite/sdk';

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
import { useTimeseriesMetadataColumns } from './useTimeseriesMetadataColumns';

interface Props {
  resourceExternalId?: string;
  labels?: string[];
  onClick?: (item: WithDetailViewData<InternalTimeseriesData>) => void;
  onParentAssetClick: (asset: Asset) => void;
}

export const TimeseriesRelatedSearchResults: React.FC<Props> = ({
  resourceExternalId,
  labels,
  onClick,
  onParentAssetClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [timeseriesFilter, setTimeseriesFilter] =
    useState<InternalTimeseriesFilters>({});
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);
  const { metadataColumns, setMetadataKeyQuery } =
    useTimeseriesMetadataColumns();

  const columns = useMemo(() => {
    return [
      tableColumns.name(),
      tableColumns.relationshipLabels,
      tableColumns.relation,
      tableColumns.externalId(),
      tableColumns.description(),
      tableColumns.lastUpdatedTime,
      tableColumns.created,
      tableColumns.assets(onParentAssetClick),
      ...metadataColumns,
    ] as ColumnDef<WithDetailViewData<InternalTimeseriesData>>[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataColumns]);

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
      onChangeSearchInput={setMetadataKeyQuery}
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

import React, { useMemo, useState } from 'react';

import {
  DefaultPreviewFilter,
  Table,
  getTableColumns,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';
import { useDebounce } from 'use-debounce';

import { Asset } from '@cognite/sdk';

import {
  InternalTimeseriesFilters,
  getHiddenColumns,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  InternalTimeseriesData,
  TableSortBy,
  WithDetailViewData,
  useRelatedTimeseriesQuery,
  useRelationshipLabels,
} from '@data-exploration-lib/domain-layer';

import { RelationshipFilter } from '../../../Filters';
import { AppliedFiltersTags } from '../AppliedFiltersTags';

import { TimeseriesTableFilters } from './TimeseriesTableFilters';
import { useTimeseriesMetadataColumns } from './useTimeseriesMetadataColumns';

const visibleColumns = [
  'name',
  'relationshipLabels',
  'relation',
  'externalId',
  'description',
  'lastUpdatedTime',
  'created',
  'directAsset',
];

interface Props {
  resourceExternalId?: string;
  onClick?: (item: WithDetailViewData<InternalTimeseriesData>) => void;
  onParentAssetClick: (asset: Asset) => void;
}

export const TimeseriesRelatedSearchResults: React.FC<Props> = ({
  resourceExternalId,
  onClick,
  onParentAssetClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [timeseriesFilter, setTimeseriesFilter] =
    useState<InternalTimeseriesFilters>({});
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const [relationshipFilterLabels, setRelationshipFilterLabels] =
    useState<string[]>();

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
      relationshipFilter: { labels: relationshipFilterLabels },
      timeseriesFilter,
      query: debouncedQuery,
      sortBy,
    });

  const { data: relationshipLabels } = useRelationshipLabels({
    resourceExternalId,
    relationshipResourceTypes: ['timeSeries'],
  });

  const handleFilterChange = (newValue: InternalTimeseriesFilters) => {
    setTimeseriesFilter((prevState) => ({ ...prevState, ...newValue }));
  };

  return (
    <Table
      id="timeseries-related-search-results"
      enableSorting
      showLoadButton
      columns={columns}
      hiddenColumns={getHiddenColumns(columns, visibleColumns)}
      query={debouncedQuery}
      onChangeSearchInput={setMetadataKeyQuery}
      onRowClick={onClick}
      sorting={sortBy}
      onSort={setSortBy}
      data={data}
      isDataLoading={isLoading}
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
          <RelationshipFilter
            options={relationshipLabels}
            onChange={setRelationshipFilterLabels}
            value={relationshipFilterLabels}
          />
          <TimeseriesTableFilters
            filter={timeseriesFilter}
            onFilterChange={handleFilterChange}
          />
        </DefaultPreviewFilter>
      }
    />
  );
};

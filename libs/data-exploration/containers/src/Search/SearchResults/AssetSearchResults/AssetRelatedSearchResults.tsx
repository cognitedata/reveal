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

import { Asset } from '@cognite/sdk';

import {
  InternalAssetFilters,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  InternalAssetData,
  TableSortBy,
  WithDetailViewData,
  useRelatedAssetsQuery,
} from '@data-exploration-lib/domain-layer';

import { AppliedFiltersTags } from '../AppliedFiltersTags';

import { AssetTableFilters } from './AssetTableFilters';

interface Props {
  resourceExternalId?: string;
  labels?: string[];
  onClick?: (item: Asset) => void;
}

export const AssetRelatedSearchResults: React.FC<Props> = ({
  resourceExternalId,
  labels,
  onClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [assetFilter, setAssetFilter] = useState<InternalAssetFilters>({});
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const columns = [
    tableColumns.name(),
    tableColumns.relationshipLabels,
    tableColumns.relation,
    tableColumns.externalId(),
    tableColumns.rootAsset(onClick),
  ] as ColumnDef<WithDetailViewData<InternalAssetData>>[];

  const { data, hasNextPage, fetchNextPage, isLoading } = useRelatedAssetsQuery(
    {
      resourceExternalId,
      relationshipFilter: { labels },
      assetFilter,
      query: debouncedQuery,
      sortBy,
    }
  );

  const handleFilterChange = (newValue: InternalAssetFilters) => {
    setAssetFilter((prevState) => ({ ...prevState, ...newValue }));
  };

  if (isEmpty(data)) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <Table
      id="asset-related-search-results"
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
          filter={assetFilter}
          onFilterChange={handleFilterChange}
        />
      }
      tableHeaders={
        <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
          <AssetTableFilters
            filter={assetFilter}
            onFilterChange={handleFilterChange}
          />
        </DefaultPreviewFilter>
      }
    />
  );
};

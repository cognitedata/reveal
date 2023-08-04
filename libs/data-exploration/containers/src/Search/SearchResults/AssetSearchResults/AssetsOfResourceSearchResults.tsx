import React, { useState } from 'react';

import { DefaultPreviewFilter, EmptyState } from '@data-exploration/components';
import isEmpty from 'lodash/isEmpty';
import { useDebounce } from 'use-debounce';

import { InternalAssetFilters, ResourceItem } from '@data-exploration-lib/core';
import {
  TableSortBy,
  useAssetsOfResourceQuery,
} from '@data-exploration-lib/domain-layer';

import { AppliedFiltersTags } from '../AppliedFiltersTags';

import { AssetTable } from './AssetTable';
import { AssetTableFilters } from './AssetTableFilters';

interface Props {
  resource: ResourceItem;
  onItemClicked: (id: number) => void;
  isDocumentsApiEnabled?: boolean;
}

export const AssetsOfResourceSearchResults: React.FC<Props> = ({
  resource,
  onItemClicked,
  isDocumentsApiEnabled = true,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [filter, setFilter] = useState<InternalAssetFilters>({});
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

  const { data, isLoading, hasNextPage, fetchNextPage } =
    useAssetsOfResourceQuery({
      resource,
      filter,
      query: debouncedQuery,
      sortBy,
      isDocumentsApiEnabled,
    });

  const handleFilterChange = (newValue: InternalAssetFilters) => {
    setFilter((prevState) => ({ ...prevState, ...newValue }));
  };

  if (isEmpty(data)) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <AssetTable
      id="assets-of-resource-search-results"
      enableSorting
      showLoadButton
      query={debouncedQuery}
      onRowClick={(asset) => onItemClicked(asset.id)}
      sorting={sortBy}
      onSort={setSortBy}
      data={data}
      hasNextPage={hasNextPage}
      fetchMore={fetchNextPage}
      tableSubHeaders={
        <AppliedFiltersTags
          filter={filter}
          onFilterChange={handleFilterChange}
        />
      }
      tableHeaders={
        <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
          <AssetTableFilters
            filter={filter}
            onFilterChange={handleFilterChange}
          />
        </DefaultPreviewFilter>
      }
    />
  );
};

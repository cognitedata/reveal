import React, { useMemo, useState } from 'react';

import { DefaultPreviewFilter } from '@data-exploration/components';
import { useDebounce } from 'use-debounce';

import { Asset } from '@cognite/sdk';

import { InternalAssetFilters } from '@data-exploration-lib/core';
import {
  TableSortBy,
  useAssetsSearchResultQuery,
} from '@data-exploration-lib/domain-layer';

import { AppliedFiltersTags } from '../AppliedFiltersTags';

import { AssetTable } from './AssetTable';
import { AssetTableFilters } from './AssetTableFilters';

interface Props {
  defaultFilter: InternalAssetFilters;
  onClick: (item: Asset) => void;
}

export const AssetLinkedSearchResults: React.FC<Props> = ({
  defaultFilter,
  onClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [filter, setFilter] = useState<InternalAssetFilters>({});
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

  const assetFilter = useMemo(() => {
    return {
      ...filter,
      ...defaultFilter,
    };
  }, [filter, defaultFilter]);

  const { data, hasNextPage, fetchNextPage } = useAssetsSearchResultQuery({
    query: debouncedQuery,
    assetFilter,
    sortBy,
  });

  const appliedFilters = { ...filter, assetSubtreeIds: undefined };

  const handleFilterChange = (newValue: InternalAssetFilters) => {
    setFilter((prevState) => ({ ...prevState, ...newValue }));
  };

  return (
    <AssetTable
      id="asset-linked-search-results"
      enableSorting
      showLoadButton
      query={debouncedQuery}
      onRowClick={onClick}
      sorting={sortBy}
      onSort={setSortBy}
      data={data}
      hasNextPage={hasNextPage}
      fetchMore={fetchNextPage}
      tableSubHeaders={
        <AppliedFiltersTags
          filter={appliedFilters}
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

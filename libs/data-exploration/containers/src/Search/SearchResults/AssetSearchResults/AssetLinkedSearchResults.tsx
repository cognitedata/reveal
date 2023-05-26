import React, { useMemo, useState } from 'react';

import {
  DefaultPreviewFilter,
  PreviewFilterDropdown,
} from '@data-exploration/components';
import {
  InternalAssetFilters,
  InternalCommonFilters,
} from '@data-exploration-lib/core';
import {
  TableSortBy,
  useAssetsSearchResultQuery,
} from '@data-exploration-lib/domain-layer';
import { useDebounce } from 'use-debounce';

import { Asset } from '@cognite/sdk';

import { LabelFilter, MetadataFilter, SourceFilter } from '../../../Filters';
import { AppliedFiltersTags } from '../AppliedFiltersTags';

import { AssetTable } from './AssetTable';

interface Props {
  defaultFilter: InternalCommonFilters;
  onClick: (item: Asset) => void;
}

const LinkedAssetFilter = ({
  filter,
  onFilterChange,
}: {
  filter: InternalAssetFilters;
  onFilterChange: (newValue: InternalAssetFilters) => void;
}) => {
  return (
    <PreviewFilterDropdown>
      <LabelFilter.Asset
        filter={filter}
        value={filter.labels}
        onChange={(newFilters) => onFilterChange({ labels: newFilters })}
        addNilOption
      />
      <SourceFilter.Asset
        filter={filter}
        value={filter.sources}
        onChange={(newSources) =>
          onFilterChange({
            sources: newSources,
          })
        }
      />
      <MetadataFilter.Assets
        filter={filter}
        values={filter.metadata}
        onChange={(newMetadata) => {
          onFilterChange({ metadata: newMetadata });
        }}
      />
    </PreviewFilterDropdown>
  );
};

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
      query={debouncedQuery}
      onRowClick={(asset) => onClick(asset)}
      data={data}
      enableSorting
      sorting={sortBy}
      onSort={(props) => setSortBy(props)}
      showLoadButton
      tableSubHeaders={
        <AppliedFiltersTags
          filter={appliedFilters}
          onFilterChange={handleFilterChange}
        />
      }
      tableHeaders={
        <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
          <LinkedAssetFilter
            filter={assetFilter}
            onFilterChange={handleFilterChange}
          />
        </DefaultPreviewFilter>
      }
      hasNextPage={hasNextPage}
      fetchMore={fetchNextPage}
    />
  );
};

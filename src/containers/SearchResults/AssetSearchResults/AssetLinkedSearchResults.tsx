import { Asset } from '@cognite/sdk';
import { useList } from '@cognite/sdk-react-query-hooks';
import { MetadataFilterV2 } from 'components';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';
import { TableSortBy } from 'components/ReactTable/V2';
import { AssetNewTable } from 'containers/Assets';
import { transformNewFilterToOldFilter } from 'domain/transformers';
import {
  InternalAssetFilters,
  useAssetsSearchResultQuery,
} from 'domain/assets';
import React, { useMemo, useState } from 'react';
import { PreviewFilterDropdown } from 'components/PreviewFilter/PreviewFilterDropdown';
import { DefaultPreviewFilter } from 'components/PreviewFilter/PreviewFilter';
import { InternalCommonFilters } from 'domain/types';
import { useDebounce } from 'use-debounce';
import { convertResourceType } from 'types';
import { useResourceResults } from '../SearchResultLoader';

interface Props {
  enableAdvancedFilter?: boolean;
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
  const { data: items = [] } = useList('assets', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return (
    <PreviewFilterDropdown>
      <MetadataFilterV2
        items={items}
        value={filter.metadata}
        setValue={newValue => onFilterChange({ metadata: newValue })}
      />
    </PreviewFilterDropdown>
  );
};

export const AssetLinkedSearchResults: React.FC<Props> = ({
  enableAdvancedFilter,
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

  const api = convertResourceType('asset');
  const { canFetchMore, fetchMore, items } = useResourceResults<Asset>(
    api,
    debouncedQuery,
    assetFilter
  );

  const appliedFilters = { ...filter, assetSubtreeIds: undefined };

  return (
    <AssetNewTable
      id="asset-linked-search-results"
      onRowClick={asset => onClick(asset)}
      data={enableAdvancedFilter ? data : items}
      enableSorting
      onSort={props => setSortBy(props)}
      showLoadButton
      tableSubHeaders={
        <AppliedFiltersTags
          filter={appliedFilters}
          onFilterChange={setFilter}
        />
      }
      tableHeaders={
        <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
          <LinkedAssetFilter
            filter={filter}
            onFilterChange={newValue =>
              setFilter(prevState => ({ ...prevState, ...newValue }))
            }
          />
        </DefaultPreviewFilter>
      }
      hasNextPage={enableAdvancedFilter ? hasNextPage : canFetchMore}
      fetchMore={enableAdvancedFilter ? fetchNextPage : fetchMore}
    />
  );
};

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
  InternalAssetFilters,
  getHiddenColumns,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  InternalAssetData,
  TableSortBy,
  WithDetailViewData,
  useRelatedAssetsQuery,
  useRelationshipLabels,
} from '@data-exploration-lib/domain-layer';

import { RelationshipFilter } from '../../../Filters';
import { AppliedFiltersTags } from '../AppliedFiltersTags';

import { AssetTableFilters } from './AssetTableFilters';
import { useAssetsMetadataColumns } from './useAssetsMetadataColumns';

const visibleColumns = [
  'name',
  'relationshipLabels',
  'relation',
  'externalId',
  'rootAsset',
];

interface Props {
  resourceExternalId?: string;
  onClick?: (item: Asset) => void;
}

export const AssetRelatedSearchResults: React.FC<Props> = ({
  resourceExternalId,
  onClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [assetFilter, setAssetFilter] = useState<InternalAssetFilters>({});
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const [relationshipFilterLabels, setRelationshipFilterLabels] =
    useState<string[]>();

  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);
  const { metadataColumns, setMetadataKeyQuery } = useAssetsMetadataColumns();

  const columns = useMemo(() => {
    return [
      tableColumns.name(),
      tableColumns.relationshipLabels,
      tableColumns.relation,
      tableColumns.externalId(),
      tableColumns.rootAsset(onClick),
      ...metadataColumns,
    ] as ColumnDef<WithDetailViewData<InternalAssetData>>[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataColumns]);

  const { data, hasNextPage, fetchNextPage, isLoading } = useRelatedAssetsQuery(
    {
      resourceExternalId,
      relationshipFilter: { labels: relationshipFilterLabels },
      assetFilter,
      query: debouncedQuery,
      sortBy,
    }
  );

  const { data: relationshipLabels } = useRelationshipLabels({
    resourceExternalId,
    relationshipResourceTypes: ['asset'],
  });

  const handleFilterChange = (newValue: InternalAssetFilters) => {
    setAssetFilter((prevState) => ({ ...prevState, ...newValue }));
  };

  return (
    <Table
      id="asset-related-search-results"
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
          filter={assetFilter}
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
          <AssetTableFilters
            filter={assetFilter}
            onFilterChange={handleFilterChange}
          />
        </DefaultPreviewFilter>
      }
    />
  );
};

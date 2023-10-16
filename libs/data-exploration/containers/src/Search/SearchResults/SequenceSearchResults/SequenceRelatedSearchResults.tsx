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

import {
  InternalSequenceFilters,
  getHiddenColumns,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  InternalSequenceData,
  TableSortBy,
  WithDetailViewData,
  useRelatedSequenceQuery,
  useRelationshipLabels,
} from '@data-exploration-lib/domain-layer';

import { RelationshipFilter } from '../../../Filters';
import { AppliedFiltersTags } from '../AppliedFiltersTags';

import { SequenceTableFilters } from './SequenceTableFilters';
import { useSequencesMetadataColumns } from './useSequencesMetadataColumns';

const visibleColumns = [
  'name',
  'relationshipLabels',
  'relation',
  'mimeType',
  'uploadedTime',
  'lastUpdatedTime',
  'created',
];

interface Props {
  resourceExternalId?: string;
  onClick?: (item: WithDetailViewData<InternalSequenceData>) => void;
}

export const SequenceRelatedSearchResults: React.FC<Props> = ({
  resourceExternalId,
  onClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [sequenceFilter, setSequenceFilter] = useState<InternalSequenceFilters>(
    {}
  );
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const [relationshipFilterLabels, setRelationshipFilterLabels] =
    useState<string[]>();

  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);
  const { metadataColumns, setMetadataKeyQuery } =
    useSequencesMetadataColumns();

  const columns = useMemo(() => {
    return [
      tableColumns.name(),
      tableColumns.relationshipLabels,
      tableColumns.relation,
      tableColumns.mimeType,
      tableColumns.uploadedTime,
      tableColumns.lastUpdatedTime,
      tableColumns.created,
      ...metadataColumns,
    ] as ColumnDef<WithDetailViewData<InternalSequenceData>>[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataColumns]);

  const { data, hasNextPage, fetchNextPage, isLoading } =
    useRelatedSequenceQuery({
      resourceExternalId,
      relationshipFilter: { labels: relationshipFilterLabels },
      sequenceFilter,
      query: debouncedQuery,
      sortBy,
    });

  const { data: relationshipLabels } = useRelationshipLabels({
    resourceExternalId,
    relationshipResourceTypes: ['sequence'],
  });

  const handleFilterChange = (newValue: InternalSequenceFilters) => {
    setSequenceFilter((prevState) => ({ ...prevState, ...newValue }));
  };

  if (isEmpty(data)) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <Table
      id="sequence-related-search-results"
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
      hasNextPage={hasNextPage}
      fetchMore={fetchNextPage}
      tableSubHeaders={
        <AppliedFiltersTags
          filter={sequenceFilter}
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
          <SequenceTableFilters
            filter={sequenceFilter}
            onFilterChange={handleFilterChange}
          />
        </DefaultPreviewFilter>
      }
    />
  );
};

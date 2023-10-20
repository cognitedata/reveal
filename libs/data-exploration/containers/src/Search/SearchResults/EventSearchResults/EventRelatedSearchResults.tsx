import React, { useMemo, useState } from 'react';

import {
  DefaultPreviewFilter,
  Table,
  getTableColumns,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';
import { useDebounce } from 'use-debounce';

import {
  InternalEventsFilters,
  getHiddenColumns,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  InternalEventsData,
  TableSortBy,
  WithDetailViewData,
  useRelatedEventsQuery,
  useRelationshipLabels,
} from '@data-exploration-lib/domain-layer';

import { RelationshipFilter } from '../../../Filters';
import { AppliedFiltersTags } from '../AppliedFiltersTags';

import { EventTableFilters } from './EventTableFilters';
import { useEventsMetadataColumns } from './useEventsMetadataColumns';

const visibleColumns = [
  'type',
  'relationshipLabels',
  'relation',
  'externalId',
  'lastUpdatedTime',
  'created',
];

interface Props {
  resourceExternalId?: string;
  onClick?: (item: WithDetailViewData<InternalEventsData>) => void;
}

export const EventRelatedSearchResults: React.FC<Props> = ({
  resourceExternalId,
  onClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [eventFilter, setEventFilter] = useState<InternalEventsFilters>({});
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const [relationshipFilterLabels, setRelationshipFilterLabels] =
    useState<string[]>();

  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);
  const { metadataColumns, setMetadataKeyQuery } = useEventsMetadataColumns();

  const columns = useMemo(() => {
    return [
      tableColumns.type(),
      tableColumns.relationshipLabels,
      tableColumns.relation,
      tableColumns.externalId(),
      tableColumns.lastUpdatedTime,
      tableColumns.created,
      ...metadataColumns,
    ] as ColumnDef<WithDetailViewData<InternalEventsData>>[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataColumns]);

  const { data, hasNextPage, fetchNextPage, isLoading } = useRelatedEventsQuery(
    {
      resourceExternalId,
      relationshipFilter: { labels: relationshipFilterLabels },
      eventFilter,
      query: debouncedQuery,
      sortBy,
    }
  );

  const { data: relationshipLabels } = useRelationshipLabels({
    resourceExternalId,
    relationshipResourceTypes: ['event'],
  });

  const handleFilterChange = (newValue: InternalEventsFilters) => {
    setEventFilter((prevState) => ({ ...prevState, ...newValue }));
  };

  return (
    <Table
      id="event-related-search-results"
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
          filter={eventFilter}
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
          <EventTableFilters
            filter={eventFilter}
            onFilterChange={handleFilterChange}
          />
        </DefaultPreviewFilter>
      }
    />
  );
};

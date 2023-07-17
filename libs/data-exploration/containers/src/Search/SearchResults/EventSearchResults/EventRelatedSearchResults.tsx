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
  InternalEventsFilters,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  InternalEventsData,
  TableSortBy,
  WithDetailViewData,
  useRelatedEventsQuery,
} from '@data-exploration-lib/domain-layer';

import { AppliedFiltersTags } from '../AppliedFiltersTags';

import { EventTableFilters } from './EventTableFilters';
import { useEventsMetadataColumns } from './useEventsMetadataColumns';

interface Props {
  resourceExternalId?: string;
  labels?: string[];
  onClick?: (item: WithDetailViewData<InternalEventsData>) => void;
}

export const EventRelatedSearchResults: React.FC<Props> = ({
  resourceExternalId,
  labels,
  onClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [eventFilter, setEventFilter] = useState<InternalEventsFilters>({});
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

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
      relationshipFilter: { labels },
      eventFilter,
      query: debouncedQuery,
      sortBy,
    }
  );

  const handleFilterChange = (newValue: InternalEventsFilters) => {
    setEventFilter((prevState) => ({ ...prevState, ...newValue }));
  };

  if (isEmpty(data)) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <Table
      id="event-related-search-results"
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
          filter={eventFilter}
          onFilterChange={handleFilterChange}
        />
      }
      tableHeaders={
        <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
          <EventTableFilters
            filter={eventFilter}
            onFilterChange={handleFilterChange}
          />
        </DefaultPreviewFilter>
      }
    />
  );
};

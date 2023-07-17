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

import { Document, FileInfo } from '@cognite/sdk';

import {
  InternalDocumentFilter,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  TableSortBy,
  WithDetailViewData,
  useRelatedDocumentsQuery,
  useRelatedFilesQuery,
} from '@data-exploration-lib/domain-layer';

import { AppliedFiltersTags } from '../AppliedFiltersTags';
import { useDocumentsMetadataColumns } from '../DocumentSearchResults';

import { FileTableFiltersDocument } from './FileTableFilters';

interface Props {
  resourceExternalId?: string;
  labels?: string[];
  onClick?: (
    item: WithDetailViewData<FileInfo> | WithDetailViewData<Document>
  ) => void;
  isDocumentsApiEnabled?: boolean;
}

export const FileRelatedSearchResults: React.FC<Props> = ({
  resourceExternalId,
  labels,
  onClick,
  isDocumentsApiEnabled = true,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [documentFilter, setDocumentFilter] = useState<InternalDocumentFilter>(
    {}
  );
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);
  const { metadataColumns, setMetadataKeyQuery } =
    useDocumentsMetadataColumns();

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
    ] as ColumnDef<
      WithDetailViewData<FileInfo> | WithDetailViewData<Document>
    >[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataColumns]);

  const filesQuery = useRelatedFilesQuery({
    resourceExternalId,
    relationshipFilter: { labels },
  });

  const documentsQuery = useRelatedDocumentsQuery({
    resourceExternalId,
    relationshipFilter: { labels },
    documentFilter,
    query: debouncedQuery,
    sortBy,
  });

  const { data, isLoading, hasNextPage, fetchNextPage } = isDocumentsApiEnabled
    ? documentsQuery
    : filesQuery;

  const handleDocumentFilterChange = (newValue: InternalDocumentFilter) => {
    setDocumentFilter((prevState) => ({ ...prevState, ...newValue }));
  };

  if (isEmpty(data)) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <Table
      id="file-related-search-results"
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
        isDocumentsApiEnabled ? (
          <AppliedFiltersTags
            filter={documentFilter}
            onFilterChange={handleDocumentFilterChange}
          />
        ) : (
          <></>
        )
      }
      tableHeaders={
        <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
          {isDocumentsApiEnabled ? (
            <FileTableFiltersDocument
              filter={documentFilter}
              onFilterChange={handleDocumentFilterChange}
            />
          ) : (
            <></>
          )}
        </DefaultPreviewFilter>
      }
    />
  );
};

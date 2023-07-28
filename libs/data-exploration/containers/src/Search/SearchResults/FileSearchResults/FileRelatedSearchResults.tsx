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
  getHiddenColumns,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  TableSortBy,
  WithDetailViewData,
  useRelatedDocumentsQuery,
  useRelatedFilesQuery,
} from '@data-exploration-lib/domain-layer';

import { OldFileGroupTable } from '../../../Temp';
import { AppliedFiltersTags } from '../AppliedFiltersTags';
import {
  FileGroupingTable,
  useDocumentsMetadataColumns,
} from '../DocumentSearchResults';

import {
  GroupingTableContainer,
  GroupingTableContentWrapper,
  GroupingTableWrapper,
} from './elements';
import { FileTableFiltersDocument } from './FileTableFilters';
import { FileViewSwitcher } from './FileViewSwitcher';

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
  labels?: string[];
  onClick?: (
    item: WithDetailViewData<FileInfo> | WithDetailViewData<Document>
  ) => void;
  isDocumentsApiEnabled?: boolean;
  isGroupingFilesEnabled?: boolean;
}

export const FileRelatedSearchResults: React.FC<Props> = ({
  resourceExternalId,
  labels,
  onClick,
  isDocumentsApiEnabled = true,
  isGroupingFilesEnabled = true,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [documentFilter, setDocumentFilter] = useState<InternalDocumentFilter>(
    {}
  );
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const [currentView, setCurrentView] = useState(
    isGroupingFilesEnabled ? 'tree' : 'list'
  );

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
    enabled: !isDocumentsApiEnabled,
  });

  const documentsQuery = useRelatedDocumentsQuery({
    resourceExternalId,
    relationshipFilter: { labels },
    documentFilter,
    query: debouncedQuery,
    sortBy,
    enabled: isDocumentsApiEnabled,
    limit: 1000,
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

  if (currentView === 'tree') {
    return (
      <GroupingTableContainer>
        <GroupingTableContentWrapper>
          {isDocumentsApiEnabled && (
            <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
              <FileTableFiltersDocument
                filter={documentFilter}
                onFilterChange={handleDocumentFilterChange}
              />
            </DefaultPreviewFilter>
          )}

          {isGroupingFilesEnabled && (
            <FileViewSwitcher
              setCurrentView={setCurrentView}
              currentView={currentView}
            />
          )}
        </GroupingTableContentWrapper>

        {isDocumentsApiEnabled && (
          <AppliedFiltersTags
            filter={documentFilter}
            onFilterChange={handleDocumentFilterChange}
          />
        )}

        <GroupingTableWrapper>
          {isDocumentsApiEnabled ? (
            <FileGroupingTable data={data} onItemClicked={onClick} />
          ) : (
            <OldFileGroupTable
              query={debouncedQuery}
              currentView={currentView}
              setCurrentView={setCurrentView}
              onItemClicked={onClick}
            />
          )}
        </GroupingTableWrapper>
      </GroupingTableContainer>
    );
  }

  return (
    <Table
      id="file-related-search-results"
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
        isDocumentsApiEnabled ? (
          <AppliedFiltersTags
            filter={documentFilter}
            onFilterChange={handleDocumentFilterChange}
          />
        ) : undefined
      }
      tableHeaders={
        <>
          {isDocumentsApiEnabled && (
            <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
              <FileTableFiltersDocument
                filter={documentFilter}
                onFilterChange={handleDocumentFilterChange}
              />
            </DefaultPreviewFilter>
          )}
          {isGroupingFilesEnabled && (
            <FileViewSwitcher
              setCurrentView={setCurrentView}
              currentView={currentView}
            />
          )}
        </>
      }
    />
  );
};

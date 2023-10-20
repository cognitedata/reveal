import React, { useMemo, useState } from 'react';

import {
  DefaultPreviewFilter,
  Table,
  getTableColumns,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';
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
  useRelationshipLabels,
} from '@data-exploration-lib/domain-layer';

import { RelationshipFilter } from '../../../Filters';
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
  'lastUpdatedTime',
  'created',
];

interface Props {
  resourceExternalId?: string;
  onClick?: (
    item: WithDetailViewData<FileInfo> | WithDetailViewData<Document>
  ) => void;
  isDocumentsApiEnabled?: boolean;
  isGroupingFilesEnabled?: boolean;
}

export const FileRelatedSearchResults: React.FC<Props> = ({
  resourceExternalId,
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
  const [relationshipFilterLabels, setRelationshipFilterLabels] =
    useState<string[]>();

  const [currentView, setCurrentView] = useState(
    isGroupingFilesEnabled ? 'tree' : 'list'
  );

  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);
  const { metadataColumns, setMetadataKeyQuery } =
    useDocumentsMetadataColumns();

  const columns = useMemo(() => {
    if (isDocumentsApiEnabled) {
      return [
        { ...tableColumns.name(), accessorKey: 'sourceFile.name' },
        tableColumns.relationshipLabels,
        tableColumns.relation,
        { ...tableColumns.mimeType, accessorKey: 'sourceFile.mimeType' },
        { ...tableColumns.lastUpdatedTime, accessorKey: 'modifiedTime' },
        tableColumns.created,
        ...metadataColumns,
      ] as ColumnDef<
        WithDetailViewData<FileInfo> | WithDetailViewData<Document>
      >[];
    }

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
  }, [isDocumentsApiEnabled, metadataColumns]);

  const filesQuery = useRelatedFilesQuery({
    resourceExternalId,
    relationshipFilter: { labels: relationshipFilterLabels },
    enabled: !isDocumentsApiEnabled,
  });

  const documentsQuery = useRelatedDocumentsQuery({
    resourceExternalId,
    relationshipFilter: { labels: relationshipFilterLabels },
    documentFilter,
    query: debouncedQuery,
    sortBy,
    enabled: isDocumentsApiEnabled,
    limit: 1000,
  });

  const { data: relationshipLabels } = useRelationshipLabels({
    resourceExternalId,
    relationshipResourceTypes: ['file'],
  });

  const { data, isLoading, hasNextPage, fetchNextPage } = isDocumentsApiEnabled
    ? documentsQuery
    : filesQuery;

  const handleDocumentFilterChange = (newValue: InternalDocumentFilter) => {
    setDocumentFilter((prevState) => ({ ...prevState, ...newValue }));
  };

  if (currentView === 'tree') {
    return (
      <GroupingTableContainer>
        <GroupingTableContentWrapper>
          {isDocumentsApiEnabled && (
            <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
              <RelationshipFilter
                options={relationshipLabels}
                onChange={setRelationshipFilterLabels}
                value={relationshipFilterLabels}
              />
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
            <FileGroupingTable
              data={data}
              isLoading={isLoading}
              onItemClicked={onClick}
            />
          ) : (
            <OldFileGroupTable
              query={debouncedQuery}
              currentView={currentView}
              isLoading={isLoading}
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
      isDataLoading={isLoading}
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
              <RelationshipFilter
                options={relationshipLabels}
                onChange={setRelationshipFilterLabels}
                value={relationshipFilterLabels}
              />
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

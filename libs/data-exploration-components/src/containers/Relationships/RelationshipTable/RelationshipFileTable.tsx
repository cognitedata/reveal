import { useMemo, useState } from 'react';

import {
  EmptyState,
  getTableColumns,
  Table,
} from '@data-exploration/components';
import {
  FileGroupingTable,
  FileViewSwitcher,
  ResultCount,
  SearchResultCountLabel,
} from '@data-exploration/containers';
import { ColumnDef } from '@tanstack/react-table';
import isEmpty from 'lodash/isEmpty';

import { DocumentSearchItem } from '@cognite/sdk';

import {
  FileWithRelationshipLabels,
  ResourceTypes,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  addDetailViewData,
  buildAdvancedFilterFromDetailViewData,
  useDocumentSearchQuery,
  useRelatedResourceDataForDetailView,
} from '@data-exploration-lib/domain-layer';

import {
  useRelatedResourceResults,
  useRelationshipCount,
} from '../../../hooks';
import {
  GroupingTableContainer,
  GroupingTableHeader,
  FileSwitcherWrapper,
} from '../elements';

import { RelationshipTableProps } from './RelationshipTable';

export function RelationshipFileTable({
  parentResource,
  labels,
  onItemClicked,
  isGroupingFilesEnabled,
  isDocumentsApiEnabled,
}: Omit<RelationshipTableProps, 'type'>) {
  const [currentView, setCurrentView] = useState<string>(
    isGroupingFilesEnabled ? 'tree' : 'list'
  );

  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const columns = useMemo(() => {
    return [
      tableColumns.name(),
      tableColumns.relationshipLabels,
      tableColumns.relation,
      tableColumns.mimeType,
      tableColumns.uploadedTime,
      tableColumns.lastUpdatedTime,
      tableColumns.created,
    ] as ColumnDef<FileWithRelationshipLabels>[];
  }, []);

  const { data: detailViewRelatedResourcesData } =
    useRelatedResourceDataForDetailView({
      resourceExternalId: parentResource.externalId,
      relationshipResourceType: ResourceTypes.File,
      filter: { labels },
    });

  const hasRelationships = !isEmpty(detailViewRelatedResourcesData);

  const documentsQuery = useDocumentSearchQuery(
    {
      filter: buildAdvancedFilterFromDetailViewData(
        detailViewRelatedResourcesData
      ),
      limit: 20,
    },
    { enabled: hasRelationships && isDocumentsApiEnabled }
  );

  const filesQuery = useRelatedResourceResults<FileWithRelationshipLabels>(
    'relationship',
    'file',
    parentResource,
    isGroupingFilesEnabled ? 1000 : 20
  );

  const { fetchNextPage, hasNextPage, isLoading } = isDocumentsApiEnabled
    ? documentsQuery
    : filesQuery;

  const tableData = useMemo(() => {
    if (!isDocumentsApiEnabled) {
      return filesQuery.items;
    }

    const documents = documentsQuery.data
      ? documentsQuery.data?.pages
          .reduce((result, page) => {
            return [...result, ...page.items];
          }, [] as DocumentSearchItem[])
          .map(({ item }) => item)
      : [];

    return addDetailViewData(documents, detailViewRelatedResourcesData);
  }, [
    detailViewRelatedResourcesData,
    documentsQuery.data,
    filesQuery.items,
    isDocumentsApiEnabled,
  ]);

  const { data: count } = useRelationshipCount(parentResource, 'file');

  if (isEmpty(tableData)) {
    return <EmptyState isLoading={hasRelationships && isLoading} />;
  }

  return (
    <>
      {currentView === 'tree' && (
        <GroupingTableContainer>
          <GroupingTableHeader>
            <FileViewSwitcher
              currentView={currentView}
              setCurrentView={setCurrentView}
            />
          </GroupingTableHeader>
          <FileGroupingTable
            data={tableData as FileWithRelationshipLabels[]}
            onItemClicked={(file) => onItemClicked(file.id)}
          />
        </GroupingTableContainer>
      )}
      {currentView === 'list' && (
        <Table
          id="relationship-file-table"
          hideColumnToggle
          columns={columns}
          tableHeaders={
            <>
              {isDocumentsApiEnabled ? (
                <SearchResultCountLabel
                  loadedCount={tableData.length}
                  totalCount={detailViewRelatedResourcesData.length}
                  resourceType={ResourceTypes.File}
                />
              ) : (
                <ResultCount api="list" type="file" count={count} />
              )}
              <FileSwitcherWrapper>
                {isGroupingFilesEnabled && (
                  <FileViewSwitcher
                    setCurrentView={setCurrentView}
                    currentView={currentView}
                  />
                )}
              </FileSwitcherWrapper>
            </>
          }
          data={tableData as FileWithRelationshipLabels[]}
          showLoadButton
          fetchMore={fetchNextPage}
          hasNextPage={hasNextPage}
          isLoadingMore={isLoading}
          onRowClick={(row) => onItemClicked(row.id)}
        />
      )}
    </>
  );
}

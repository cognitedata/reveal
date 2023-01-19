import React, { useState } from 'react';
import {
  useRelatedResourceResults,
  useRelationshipCount,
} from '@data-exploration-components/hooks';
import { ResultCount } from '@data-exploration-components/components';
import { Table } from '@data-exploration-components/components/Table/Table';
import { ResourceTableColumns } from '@data-exploration-components/components/Table/columns';
import { RelationshipTableProps } from './RelationshipTable';

import { FileWithRelationshipLabels } from '@data-exploration-components/containers/Files/FileTable/FileTable';
import { EmptyState } from '@data-exploration-components/components/EmpyState/EmptyState';
import { ColumnDef } from '@tanstack/react-table';
import { FileViewSwitcher } from '@data-exploration-components/containers/SearchResults/FileSearchResults/FileViewSwitcher';
import FileGroupingTable from '@data-exploration-components/containers/Files/FileGroupingTable/FileGroupingTable';
import {
  GroupingTableContainer,
  GroupingTableHeader,
  FileSwitcherWrapper,
} from '../elements';

const {
  relationshipLabels,
  relation,
  name,
  mimeType,
  uploadedTime,
  lastUpdatedTime,
  created,
} = ResourceTableColumns;

const columns = [
  name(),
  relationshipLabels,
  relation,
  mimeType,
  uploadedTime,
  lastUpdatedTime,
  created,
] as ColumnDef<FileWithRelationshipLabels>[];

export function RelationshipFileTable({
  parentResource,
  onItemClicked,
  isGroupingFilesEnabled,
}: Omit<RelationshipTableProps, 'type'>) {
  const [currentView, setCurrentView] = useState<string>(
    isGroupingFilesEnabled ? 'tree' : 'list'
  );

  const { data: count } = useRelationshipCount(parentResource, 'file');

  const { hasNextPage, fetchNextPage, isLoading, items } =
    useRelatedResourceResults<FileWithRelationshipLabels>(
      'relationship',
      'file',
      parentResource,
      isGroupingFilesEnabled ? 1000 : 20
    );

  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
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
            data={items}
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
              <ResultCount api="list" type="file" count={count} />
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
          data={items}
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

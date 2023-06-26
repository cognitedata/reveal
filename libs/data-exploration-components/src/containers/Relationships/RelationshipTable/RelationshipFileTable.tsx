import React, { useMemo, useState } from 'react';

import {
  EmptyState,
  getTableColumns,
  Table,
} from '@data-exploration/components';
import {
  FileGroupingTable,
  FileViewSwitcher,
  ResultCount,
} from '@data-exploration/containers';
import {
  useRelatedResourceResults,
  useRelationshipCount,
} from '@data-exploration-components/hooks';
import { ColumnDef } from '@tanstack/react-table';

import {
  FileWithRelationshipLabels,
  useTranslation,
} from '@data-exploration-lib/core';

import {
  GroupingTableContainer,
  GroupingTableHeader,
  FileSwitcherWrapper,
} from '../elements';

import { RelationshipTableProps } from './RelationshipTable';

export function RelationshipFileTable({
  parentResource,
  onItemClicked,
  isGroupingFilesEnabled,
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

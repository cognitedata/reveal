import { ColumnDef } from '@tanstack/react-table';

import { Table } from '@data-exploration-components/components/Table';
import React, { useMemo } from 'react';

import { EmptyState } from '@data-exploration-components/components/EmpyState/EmptyState';
import { SummaryCard } from '@data-exploration-components/components/SummaryCard/SummaryCard';

import { getSummaryCardItems } from '@data-exploration-components/components/SummaryCard/utils';
import { useResourceResults } from '@data-exploration-components/containers';
import { convertResourceType } from '@data-exploration-components/types';
import { FileInfo } from '@cognite/sdk';
import { InternalFilesFilters } from '@data-exploration-lib/domain-layer';

export const FileSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick,
}: {
  query?: string;
  filter?: InternalFilesFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: FileInfo) => void;
}) => {
  const api = convertResourceType('file');
  const { items: results, isFetching: isLoading } =
    useResourceResults<FileInfo>(api, query, filter);

  const columns = useMemo(
    () =>
      [
        Table.Columns.name(query),
        Table.Columns.mimeType,
      ] as ColumnDef<FileInfo>[],
    [query]
  );

  return (
    <SummaryCard
      icon="Document"
      title="Files"
      onAllResultsClick={onAllResultsClick}
    >
      {isLoading ? (
        <EmptyState isLoading={isLoading} title="Loading results" />
      ) : (
        <Table
          data={getSummaryCardItems(results)}
          id="file-summary-table"
          columns={columns}
          onRowClick={onRowClick}
          enableColumnResizing={false}
        />
      )}
    </SummaryCard>
  );
};

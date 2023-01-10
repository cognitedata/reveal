import { ColumnDef, Row } from '@tanstack/react-table';
import {
  InternalDocument,
  InternalDocumentFilter,
  useDocumentSearchResultQuery,
} from '@data-exploration-lib/domain-layer';

import { Table } from '@data-exploration-components/components/Table';
import React, { useMemo } from 'react';

import { EmptyState } from '@data-exploration-components/components/EmpyState/EmptyState';
import { SummaryCard } from '@data-exploration-components/components/SummaryCard/SummaryCard';

import { getSummaryCardItems } from '@data-exploration-components/components/SummaryCard/utils';
import { DocumentContentPreview } from '@data-exploration-components/containers';

export const DocumentSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick,
}: {
  query?: string;
  filter?: InternalDocumentFilter;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: InternalDocument) => void;
}) => {
  const { results, isLoading } = useDocumentSearchResultQuery({
    query,
    filter,
  });

  const columns = useMemo(
    () =>
      [
        Table.Columns.name(query),
        {
          accessorKey: 'content',
          header: 'Content',
          cell: ({ row }: { row: Row<InternalDocument> }) => {
            return (
              <DocumentContentPreview document={row.original} query={query} />
            );
          },
        },
      ] as ColumnDef<InternalDocument>[],
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
          id="document-summary-table"
          columns={columns}
          onRowClick={onRowClick}
          enableColumnResizing={false}
        />
      )}
    </SummaryCard>
  );
};

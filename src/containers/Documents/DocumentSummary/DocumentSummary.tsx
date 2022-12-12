import { ColumnDef, Row } from '@tanstack/react-table';
import {
  Document,
  InternalDocumentFilter,
  useDocumentSearchResultQuery,
} from 'domain/documents';

import { Table } from 'components/Table';
import React, { useMemo } from 'react';

import { EmptyState } from 'components/EmpyState/EmptyState';
import { SummaryCard } from 'components/SummaryCard/SummaryCard';

import { getSummaryCardItems } from 'components/SummaryCard/utils';
import { DocumentContentPreview } from 'containers';

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
  onRowClick?: (row: Document) => void;
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
          cell: ({ row }: { row: Row<Document> }) => {
            return (
              <DocumentContentPreview document={row.original} query={query} />
            );
          },
        },
      ] as ColumnDef<Document>[],
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

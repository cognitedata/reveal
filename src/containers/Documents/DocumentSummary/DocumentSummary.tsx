import { ColumnDef } from '@tanstack/react-table';
import {
  Document,
  InternalDocumentFilter,
  useObserveDocumentSearchFilters,
  useDocumentSearchQuery,
} from 'domain/documents';

import { Table } from 'components/Table';
import React, { useMemo } from 'react';

import { EmptyState } from 'components/EmpyState/EmptyState';
import { SummaryCard } from 'components/SummaryCard/SummaryCard';

import { getSummaryCardItems } from 'components/SummaryCard/utils';

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
  const { results, isLoading } = useDocumentSearchQuery();
  useObserveDocumentSearchFilters(query, filter);

  const columns = useMemo(
    () =>
      [Table.Columns.name(query), Table.Columns.type] as ColumnDef<Document>[],
    [query]
  );

  return (
    <SummaryCard
      icon="Document"
      title="Documents"
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

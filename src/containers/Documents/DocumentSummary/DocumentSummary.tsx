import { ColumnDef } from '@tanstack/react-table';
import {
  Document,
  InternalDocumentFilter,
  useObserveDocumentSearchFilters,
  useDocumentSearchQuery,
} from 'domain/documents';

import { TableV2 as Table } from 'components/ReactTable/V2';
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
    () => [Table.Columns.name, Table.Columns.type] as ColumnDef<Document>[],
    []
  );

  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }
  return (
    <SummaryCard
      icon="Document"
      title="Documents"
      onAllResultsClick={onAllResultsClick}
    >
      <Table
        data={getSummaryCardItems(results)}
        id="document-summary-table"
        columns={columns}
        onRowClick={onRowClick}
        enableColumnResizing={false}
      />
    </SummaryCard>
  );
};

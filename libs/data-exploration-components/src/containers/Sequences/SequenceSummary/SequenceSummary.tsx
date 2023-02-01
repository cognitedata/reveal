import { Sequence } from '@cognite/sdk/dist/src';
import { ColumnDef } from '@tanstack/react-table';
import { useResourceResults } from '@data-exploration-components/containers';
import {
  InternalSequenceFilters,
  useSequencesMetadataKeys,
} from '@data-exploration-lib/domain-layer';
import {
  ResourceTableColumns,
  SummaryCardWrapper,
  Table,
} from '@data-exploration-components/components/Table';
import React, { useMemo } from 'react';
import { convertResourceType } from '@data-exploration-components/types';

import { getSummaryCardItems } from '@data-exploration-components/components/SummaryHeader/utils';
import { SummaryHeader } from '@data-exploration-components/components/SummaryHeader/SummaryHeader';
import { useGetHiddenColumns } from '@data-exploration-components/hooks';
import { EMPTY_OBJECT } from '@data-exploration-lib/core';

export const SequenceSummary = ({
  query = '',
  filter = EMPTY_OBJECT,
  onAllResultsClick,
  onRowClick,
}: {
  query?: string;
  filter: InternalSequenceFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: Sequence) => void;
}) => {
  const api = convertResourceType('sequence');

  const { isLoading, items } = useResourceResults<Sequence>(api, query, filter);
  const { data: metadataKeys = [] } = useSequencesMetadataKeys();

  const metadataColumns = useMemo(() => {
    return metadataKeys.map((key: string) =>
      ResourceTableColumns.metadata(key)
    );
  }, [metadataKeys]);
  const columns = useMemo(
    () =>
      [
        Table.Columns.name(query),
        Table.Columns.description(query),
        Table.Columns.externalId(query),
        Table.Columns.columns,
        Table.Columns.lastUpdatedTime,
        Table.Columns.created,
        Table.Columns.id(query),
        Table.Columns.rootAsset(),
        Table.Columns.dataSet,
        ...metadataColumns,
      ] as ColumnDef<Sequence>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, metadataColumns]
  );

  const hiddenColumns = useGetHiddenColumns(columns, ['name', 'description']);

  return (
    <SummaryCardWrapper>
      <Table
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={getSummaryCardItems(items)}
        columnSelectionLimit={2}
        id="sequence-summary-table"
        isDataLoading={isLoading}
        tableHeaders={
          <SummaryHeader
            icon="Sequences"
            title="Sequence"
            onAllResultsClick={onAllResultsClick}
          />
        }
        enableColumnResizing={false}
        onRowClick={onRowClick}
        query={query}
      />
    </SummaryCardWrapper>
  );
};

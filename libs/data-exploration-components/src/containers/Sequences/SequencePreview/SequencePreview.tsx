import React, { useMemo } from 'react';
import { Sequence } from '@cognite/sdk';

import { useInfiniteSequenceRows } from 'hooks/sequenceHooks';

import { Loader } from 'components';
import { EmptyState } from 'components/EmpyState/EmptyState';
import { Table } from 'components/Table/Table';
import { AllowedTableStateId } from 'types';

export interface SequenceDataRow {
  rowNumber: number;
  key: string;
  [id: string]: any;
}

export const SequencePreview = ({ sequence }: { sequence: Sequence }) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteSequenceRows(
      {
        id: sequence.id,
      },
      100
    );

  /*
    The trick here is to add the latest paginated results to the bottom of the existing array.
    Next up for sequences is to make sure all values are displayed as string.
    There is an unknown here for whether this will work for all kinds of sequences.
    This will support: null, strings, doubles and longs
  */
  const listItems = useMemo(
    () =>
      data?.pages?.reduce(
        (accl, t) =>
          accl.concat(
            t.rows.map(row => ({
              rowNumber: row.rowNumber,
              key: `${row.rowNumber}`,
              ...Object.values(row.values).reduce(
                (acc, val, i) => ({ ...acc, [i]: `${val}` }),
                {}
              ),
            }))
          ),
        [] as SequenceDataRow[]
      ),
    [data]
  );
  const tableColumns = useMemo(
    () =>
      sequence.columns.map((column, index) => ({
        accessorKey: `${index}`,
        header: `${column.externalId || column.id}`,
      })),
    [sequence.columns]
  );

  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }
  if (!data) {
    return <Loader />;
  }

  return (
    <Table<any & { id: AllowedTableStateId }>
      id="sequence-details-preview"
      columns={tableColumns}
      data={listItems || []}
      showLoadButton
      hasNextPage={hasNextPage}
      isLoadingMore={isFetchingNextPage}
      fetchMore={fetchNextPage}
    />
  );
};

import React from 'react';
import { Sequence } from '@cognite/sdk';
import { AllowedTableStateId, Table } from 'lib';

export type SequenceDataTableProps = {
  sequence: Sequence;
  rows: SequenceDataRow[];
  onEndReached: ({ distanceFromEnd }: { distanceFromEnd?: number }) => void;
};

export type SequenceDataRow = {
  rowNumber: number;
  key: string;
  [id: string]: any;
};

export const SequenceDataTable = (props: SequenceDataTableProps) => {
  const tableColumns = props.sequence.columns.map((c, i) => ({
    key: `${c.externalId || c.id}`,
    title: `${c.externalId || c.id}`,
    dataKey: `${i}`,
    width: 200,
  }));

  const { rows, ...restProps } = props;

  return (
    <Table<any & { id: AllowedTableStateId }>
      columns={tableColumns}
      data={rows}
      {...restProps}
    />
  );
};

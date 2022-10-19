import React from 'react';
import { Sequence } from '@cognite/sdk';
import { NewTable as Table, TableProps } from 'components/ReactTable/Table';
import { RelationshipLabels } from 'types';
import { Column } from 'react-table';

const columns = [
  Table.Columns.name,
  Table.Columns.description,
  Table.Columns.externalId,
  Table.Columns.columns,
  Table.Columns.lastUpdatedTime,
  Table.Columns.created,
  Table.Columns.id,
  Table.Columns.asset,
  Table.Columns.dataSet,
] as Column<Sequence>[];
export type SequenceWithRelationshipLabels = Sequence & RelationshipLabels;
export const SequenceNewTable = (
  props: Omit<
    TableProps<SequenceWithRelationshipLabels | Sequence>,
    'columns'
  > &
    RelationshipLabels
) => {
  return (
    <Table
      columns={columns}
      isStickyHeader
      visibleColumns={[
        'name',
        'externalId',
        'relation',
        'lastUpdatedTime',
        'createdTime',
      ]}
      {...props}
    />
  );
};

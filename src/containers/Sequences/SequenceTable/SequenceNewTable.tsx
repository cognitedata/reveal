import React from 'react';
import { Sequence } from '@cognite/sdk';
import { NewTable as Table, TableProps } from 'components/ReactTable/Table';
import { RelationshipLabels } from 'types';
import { getNewColumnsWithRelationshipLabels } from 'utils';
import { Column } from 'react-table';

export type SequenceWithRelationshipLabels = Sequence & RelationshipLabels;
export const SequenceTable = (
  props: TableProps<SequenceWithRelationshipLabels> & RelationshipLabels
) => {
  const { relatedResourceType } = props;

  const columns = [
    Table.Columns.name,
    Table.Columns.description,
    Table.Columns.externalId,
    Table.Columns.columns,
    Table.Columns.lastUpdatedTime,
    Table.Columns.created,
    Table.Columns.id,
    Table.Columns.assets,
    Table.Columns.dataSet,
  ] as Column<Sequence>[];

  const updatedColumns = getNewColumnsWithRelationshipLabels<Sequence>(
    columns,
    relatedResourceType === 'relationship'
  );

  return (
    <Table<Sequence>
      columns={updatedColumns}
      data={props.data}
      visibleColumns={[
        'name',
        'externalId',
        'relation',
        'lastUpdatedTime',
        'createdTime',
      ]}
    />
  );
};

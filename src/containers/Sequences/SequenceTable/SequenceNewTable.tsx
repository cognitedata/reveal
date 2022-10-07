import React, { useMemo } from 'react';
import { Sequence } from '@cognite/sdk';
import { NewTable as Table, TableProps } from 'components/ReactTable/Table';
import { RelationshipLabels } from 'types';
import { getNewColumnsWithRelationshipLabels } from 'utils';
import { Column } from 'react-table';

export type SequenceWithRelationshipLabels = Sequence & RelationshipLabels;
export const SequenceTable = (
  props: Omit<TableProps<SequenceWithRelationshipLabels>, 'columns'> &
    RelationshipLabels
) => {
  const { relatedResourceType, ...rest } = props;

  const columns = useMemo(
    () =>
      [
        Table.Columns.name,
        Table.Columns.description,
        Table.Columns.externalId,
        Table.Columns.columns,
        Table.Columns.lastUpdatedTime,
        Table.Columns.created,
        Table.Columns.id,
        Table.Columns.asset,
        Table.Columns.dataSet,
      ] as Column<Sequence>[],
    []
  );

  const updatedColumns = getNewColumnsWithRelationshipLabels<Sequence>(
    columns,
    relatedResourceType === 'relationship'
  );

  return (
    <Table<Sequence>
      columns={updatedColumns}
      visibleColumns={[
        'name',
        'externalId',
        'relation',
        'lastUpdatedTime',
        'createdTime',
      ]}
      {...rest}
    />
  );
};

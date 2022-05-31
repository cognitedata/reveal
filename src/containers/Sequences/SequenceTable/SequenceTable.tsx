import React from 'react';
import { Sequence } from '@cognite/sdk';
import { Table, TableProps } from 'components';
import { RelationshipLabels } from 'types';
import { getColumnsWithRelationshipLabels } from 'utils';

type SequeceWithRelationshipLabels = Sequence & RelationshipLabels;
export const SequenceTable = (
  props: TableProps<SequeceWithRelationshipLabels>
) => {
  const { relatedResourceType } = props;

  const columns = [
    Table.Columns.name,
    Table.Columns.description,
    Table.Columns.externalId,
    Table.Columns.columns,
    Table.Columns.relationships,
    Table.Columns.lastUpdatedTime,
    Table.Columns.createdTime,
  ];

  const updatedColumns = getColumnsWithRelationshipLabels(
    columns,
    relatedResourceType === 'relationship'
  );

  return <Table<Sequence> columns={updatedColumns} {...props} />;
};

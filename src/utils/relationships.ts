import { Table } from 'components';

export function getColumnsWithRelationshipLabels(
  columns: any,
  relationshipLabels?: boolean
) {
  const modifiedColumns = [
    ...columns.slice(0, 1),

    Table.Columns.relationshipLabels,
    Table.Columns.relation,

    ...columns.slice(1),
  ];
  return relationshipLabels ? modifiedColumns : columns;
}

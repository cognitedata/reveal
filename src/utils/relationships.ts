import { Table } from 'components';
import { NewTable } from 'components/ReactTable/Table';
import { Column } from 'react-table';

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

export function getNewColumnsWithRelationshipLabels<
  T extends Record<string, any>
>(columns: Column<T>[], relationshipLabels?: boolean) {
  const modifiedColumns = [
    ...columns.slice(0, 1),
    NewTable.Columns.relation,
    NewTable.Columns.relationshipLabels,
    ...columns.slice(1),
  ] as any as Column<T>[];
  return relationshipLabels ? modifiedColumns : columns;
}

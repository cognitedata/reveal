import { Table } from 'components';
import { NewTable } from 'components/ReactTable/Table';
import { Column } from 'react-table';
import { AssetWithRelationshipLabels } from 'containers/Assets/AssetTable/AssetNewTable';

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

export function getNewColumnsWithRelationshipLabels(
  columns: Column<AssetWithRelationshipLabels>[],
  relationshipLabels?: boolean
) {
  const modifiedColumns: Column<AssetWithRelationshipLabels>[] = [
    ...columns.slice(0, 1),
    NewTable.Columns.relation,
    NewTable.Columns.relationshipLabels,
    ...columns.slice(1),
  ];
  return relationshipLabels ? modifiedColumns : columns;
}

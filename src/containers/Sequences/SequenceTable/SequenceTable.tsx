import React, { useMemo } from 'react';
import { Sequence } from '@cognite/sdk';
import { Table, TableProps } from 'components/Table/Table';
import { RelationshipLabels } from 'types';

import { ColumnDef } from '@tanstack/react-table';
import { useGetHiddenColumns } from 'hooks';
import { ResourceTableColumns } from '../../../components';
import { useSequencesMetadataKeys } from '../../../domain';

export type SequenceWithRelationshipLabels = Sequence & RelationshipLabels;

const visibleColumns = [
  'name',
  'externalId',
  'relation',
  'lastUpdatedTime',
  'createdTime',
];
export const SequenceTable = ({
  query,
  ...rest
}: Omit<TableProps<SequenceWithRelationshipLabels | Sequence>, 'columns'> &
  RelationshipLabels) => {
  const { data: metadataKeys } = useSequencesMetadataKeys();

  const metadataColumns: ColumnDef<Sequence>[] = useMemo(() => {
    return (metadataKeys || []).map((key: string) =>
      ResourceTableColumns.metadata(key)
    );
  }, [metadataKeys]);
  const columns = useMemo(
    () =>
      [
        {
          ...Table.Columns.name(query),
          enableHiding: false,
        },
        Table.Columns.description(query),
        Table.Columns.externalId(query),
        {
          ...Table.Columns.columns,
          enableSorting: false,
        },
        Table.Columns.lastUpdatedTime,
        Table.Columns.created,
        {
          ...Table.Columns.id(query),
          enableSorting: false,
        },
        {
          ...Table.Columns.asset,
          enableSorting: false,
        },
        Table.Columns.dataSet,
        ...metadataColumns,
      ] as ColumnDef<Sequence>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, metadataColumns]
  );
  const hiddenColumns = useGetHiddenColumns(columns, visibleColumns);

  return <Table columns={columns} hiddenColumns={hiddenColumns} {...rest} />;
};

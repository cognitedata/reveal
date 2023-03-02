import React, { useMemo } from 'react';
import { Asset, Sequence } from '@cognite/sdk';
import {
  Table,
  TableProps,
} from '@data-exploration-components/components/Table/Table';
import { RelationshipLabels } from '@data-exploration-components/types';

import { ColumnDef, Row } from '@tanstack/react-table';
import { useGetHiddenColumns } from '@data-exploration-components/hooks';
import { ResourceTableColumns, SubRowMatchingLabel } from '../../../components';
import {
  InternalSequenceDataWithMatchingLabels,
  useSequencesMetadataKeys,
} from '@data-exploration-lib/domain-layer';
import { SubCellMatchingLabels } from '../../../components/Table/components/SubCellMatchingLabel';

export type SequenceWithRelationshipLabels = Sequence & RelationshipLabels;
const visibleColumns = [
  'name',
  'externalId',
  'relation',
  'lastUpdatedTime',
  'createdTime',
];

export interface SequenceTableProps
  extends Omit<
      TableProps<SequenceWithRelationshipLabels | Sequence>,
      'columns'
    >,
    RelationshipLabels {
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
}

export const SequenceTable = ({
  query,
  onRootAssetClick,
  ...rest
}: SequenceTableProps) => {
  const { data: metadataKeys = [] } = useSequencesMetadataKeys();

  const metadataColumns = useMemo(() => {
    return metadataKeys.map((key: string) =>
      ResourceTableColumns.metadata(key)
    );
  }, [metadataKeys]);
  const columns = useMemo(
    () =>
      [
        {
          ...Table.Columns.name(),
          enableHiding: false,
        },
        Table.Columns.description(),
        Table.Columns.externalId(),
        {
          ...Table.Columns.columns,
          enableSorting: false,
        },
        Table.Columns.lastUpdatedTime,
        Table.Columns.created,
        {
          ...Table.Columns.id(),
          enableSorting: false,
        },
        Table.Columns.rootAsset(onRootAssetClick),
        Table.Columns.assets(onRootAssetClick),
        {
          ...Table.Columns.dataSet,
          enableSorting: true,
        },
        ...metadataColumns,
      ] as ColumnDef<Sequence>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, metadataColumns]
  );
  const hiddenColumns = useGetHiddenColumns(columns, visibleColumns);

  return (
    <Table<InternalSequenceDataWithMatchingLabels>
      columns={columns}
      hiddenColumns={hiddenColumns}
      renderCellSubComponent={SubCellMatchingLabels}
      {...rest}
    />
  );
};

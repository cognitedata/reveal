import React, { useMemo } from 'react';
import { Asset, Sequence } from '@cognite/sdk';
import {
  SubCellMatchingLabels,
  Table,
  TableProps,
} from '@data-exploration/components';

import { ColumnDef } from '@tanstack/react-table';
import { InternalSequenceDataWithMatchingLabels } from '@data-exploration-lib/domain-layer';
import {
  getHiddenColumns,
  RelationshipLabels,
  SequenceWithRelationshipLabels,
} from '@data-exploration-lib/core';
import { useSequencesMetadataColumns } from '../useSequencesMetadataColumns';

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
  const { metadataColumns, setMetadataKeyQuery } =
    useSequencesMetadataColumns();

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
  const hiddenColumns = getHiddenColumns(columns, visibleColumns);

  return (
    <Table<InternalSequenceDataWithMatchingLabels>
      columns={columns}
      hiddenColumns={hiddenColumns}
      renderCellSubComponent={SubCellMatchingLabels}
      onChangeSearchInput={setMetadataKeyQuery}
      {...rest}
    />
  );
};

import React, { useMemo } from 'react';

import {
  getTableColumns,
  SubCellMatchingLabels,
  Table,
  TableProps,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

import { Asset, Sequence } from '@cognite/sdk';

import {
  getHiddenColumns,
  RelationshipLabels,
  SequenceWithRelationshipLabels,
  useTranslation,
} from '@data-exploration-lib/core';
import { InternalSequenceDataWithMatchingLabels } from '@data-exploration-lib/domain-layer';

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
  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const { metadataColumns, setMetadataKeyQuery } =
    useSequencesMetadataColumns();

  const columns = useMemo(
    () =>
      [
        {
          ...tableColumns.name(query),
          enableHiding: false,
        },
        tableColumns.description(query),
        tableColumns.externalId(query),
        {
          ...tableColumns.columns,
          enableSorting: false,
        },
        tableColumns.lastUpdatedTime,
        tableColumns.created,
        {
          ...tableColumns.id(query),
          enableSorting: false,
        },
        tableColumns.rootAsset(onRootAssetClick),
        tableColumns.assets(onRootAssetClick),
        {
          ...tableColumns.dataSet,
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

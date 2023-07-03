import React, { useMemo } from 'react';

import {
  getHighlightQuery,
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
  useGetSearchConfigFromLocalStorage,
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
  const sequenceSearchConfig = useGetSearchConfigFromLocalStorage('sequence');

  const { metadataColumns, setMetadataKeyQuery } =
    useSequencesMetadataColumns();

  const columns = useMemo(
    () =>
      [
        {
          ...tableColumns.name(
            getHighlightQuery(sequenceSearchConfig?.name.enabled, query)
          ),
          enableHiding: false,
        },
        tableColumns.description(
          getHighlightQuery(sequenceSearchConfig?.description.enabled, query)
        ),
        tableColumns.externalId(
          getHighlightQuery(sequenceSearchConfig?.externalId.enabled, query)
        ),
        {
          ...tableColumns.columns,
          enableSorting: false,
        },
        tableColumns.lastUpdatedTime,
        tableColumns.created,
        {
          ...tableColumns.id(
            getHighlightQuery(sequenceSearchConfig?.id.enabled, query)
          ),
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

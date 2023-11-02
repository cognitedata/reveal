import { useMemo } from 'react';

import {
  getTableColumns,
  Table,
  TableProps,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';
import noop from 'lodash/noop';

import { getHiddenColumns, useTranslation } from '@data-exploration-lib/core';
import {
  AssetWithRelationshipLabels,
  InternalAssetData,
} from '@data-exploration-lib/domain-layer';

import { useAssetsMetadataColumns } from '../Search';

import { Wrapper } from './elements';

export const AssetDetailsTable = ({
  onRowClick = noop,
  onRowSelection = noop,
  ...props
}: Omit<TableProps<InternalAssetData>, 'columns'>) => {
  const { t } = useTranslation();
  const { metadataColumns, setMetadataKeyQuery } = useAssetsMetadataColumns();
  const tableColumns = getTableColumns(t);

  const columns = useMemo(
    () =>
      [
        tableColumns.name(),
        tableColumns.description(),
        tableColumns.externalId(),
        tableColumns.availabilityThreeD,
        tableColumns.created,
        {
          ...tableColumns.labels,
          enableSorting: false,
        },
        tableColumns.source(),
        tableColumns.dataSet,
      ] as ColumnDef<AssetWithRelationshipLabels>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataColumns]
  );
  const hiddenColumns = getHiddenColumns(columns, ['name', 'description']);

  const onRowClickHandler = (row: InternalAssetData) => {
    if (props.enableSelection) {
      onRowClick(row);
      return;
    }

    onRowSelection(
      (old) => ({ ...old, [String(row.id)]: true }),
      [{ id: row.id, externalId: row.externalId, type: 'asset' }]
    );
  };

  return (
    <Wrapper>
      <Table<InternalAssetData>
        {...props}
        columns={columns}
        hiddenColumns={hiddenColumns}
        columnSelectionLimit={4}
        showLoadButton
        onChangeSearchInput={setMetadataKeyQuery}
        onRowClick={onRowClickHandler}
      />
    </Wrapper>
  );
};

import React, { useMemo } from 'react';
import { InternalAssetData } from '@data-exploration-lib/domain-layer';
import { Table, TableProps } from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

export const AssetDetailsTable = (
  props: Omit<TableProps<InternalAssetData>, 'columns'>
) => {
  const columns = useMemo(
    () => [Table.Columns.name()],
    []
  ) as ColumnDef<InternalAssetData>[];
  return (
    <Table<InternalAssetData>
      columns={columns}
      showLoadButton
      enableSelection
      hideColumnToggle
      {...props}
    />
  );
};

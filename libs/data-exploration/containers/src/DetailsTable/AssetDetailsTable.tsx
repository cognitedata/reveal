import React, { useMemo } from 'react';

import { Table, TableProps } from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

import { InternalAssetData } from '@data-exploration-lib/domain-layer';

import { Wrapper } from './elements';

export const AssetDetailsTable = (
  props: Omit<TableProps<InternalAssetData>, 'columns'>
) => {
  const columns = useMemo(
    () => [Table.Columns.name()],
    []
  ) as ColumnDef<InternalAssetData>[];
  return (
    <Wrapper>
      <Table<InternalAssetData>
        columns={columns}
        showLoadButton
        enableSelection
        hideColumnToggle
        {...props}
      />
    </Wrapper>
  );
};

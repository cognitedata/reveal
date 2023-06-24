import React, { useMemo } from 'react';

import {
  getTableColumns,
  Table,
  TableProps,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

import { useTranslation } from '@data-exploration-lib/core';
import { InternalAssetData } from '@data-exploration-lib/domain-layer';

import { Wrapper } from './elements';

export const AssetDetailsTable = (
  props: Omit<TableProps<InternalAssetData>, 'columns'>
) => {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [getTableColumns(t).name()],
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

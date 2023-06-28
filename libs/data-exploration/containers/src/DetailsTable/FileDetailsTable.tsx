import React, { useMemo } from 'react';

import {
  getTableColumns,
  Table,
  TableProps,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

import { FileInfo } from '@cognite/sdk/dist/src/types';

import { useTranslation } from '@data-exploration-lib/core';
import { InternalDocument } from '@data-exploration-lib/domain-layer';

import { Wrapper } from './elements';

export const FileDetailsTable = (
  props: Omit<TableProps<InternalDocument | FileInfo>, 'columns'>
) => {
  const { t } = useTranslation();

  const columns = useMemo(() => [getTableColumns(t).name()], []) as ColumnDef<
    InternalDocument | FileInfo
  >[];
  return (
    <Wrapper>
      <Table<InternalDocument | FileInfo>
        columns={columns}
        showLoadButton
        enableSelection
        hideColumnToggle
        {...props}
      />
    </Wrapper>
  );
};

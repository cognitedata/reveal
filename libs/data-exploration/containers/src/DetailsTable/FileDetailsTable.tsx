import React, { useMemo } from 'react';

import { Table, TableProps } from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

import { FileInfo } from '@cognite/sdk/dist/src/types';

import { InternalDocument } from '@data-exploration-lib/domain-layer';

import { Wrapper } from './elements';

export const FileDetailsTable = (
  props: Omit<TableProps<InternalDocument | FileInfo>, 'columns'>
) => {
  const columns = useMemo(() => [Table.Columns.name()], []) as ColumnDef<
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

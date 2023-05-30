import React, { useMemo } from 'react';

import { Table, TableProps } from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

import { InternalDocument } from '@data-exploration-lib/domain-layer';

import { Wrapper } from './elements';

export const FileDetailsTable = (
  props: Omit<TableProps<InternalDocument>, 'columns'>
) => {
  const columns = useMemo(
    () => [Table.Columns.name()],
    []
  ) as ColumnDef<InternalDocument>[];
  return (
    <Wrapper>
      <Table<InternalDocument>
        columns={columns}
        showLoadButton
        enableSelection
        hideColumnToggle
        {...props}
      />
    </Wrapper>
  );
};

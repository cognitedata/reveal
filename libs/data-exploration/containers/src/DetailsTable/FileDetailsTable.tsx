import { InternalDocument } from '@data-exploration-lib/domain-layer';
import { Table, TableProps } from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';
import React, { useMemo } from 'react';

export const FileDetailsTable = (
  props: Omit<TableProps<InternalDocument>, 'columns'>
) => {
  const columns = useMemo(
    () => [Table.Columns.name()],
    []
  ) as ColumnDef<InternalDocument>[];
  return (
    <Table<InternalDocument>
      columns={columns}
      showLoadButton
      enableSelection
      hideColumnToggle
      {...props}
    />
  );
};

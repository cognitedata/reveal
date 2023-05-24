import React, { useMemo } from 'react';
import { InternalEventsData } from '@data-exploration-lib/domain-layer';
import { Table, TableProps } from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

export const EventDetailsTable = (
  props: Omit<TableProps<InternalEventsData>, 'columns'>
) => {
  const columns = useMemo(
    () => [Table.Columns.type()],
    []
  ) as ColumnDef<InternalEventsData>[];
  return (
    <Table<InternalEventsData>
      columns={columns}
      showLoadButton
      enableSelection
      hideColumnToggle
      {...props}
    />
  );
};

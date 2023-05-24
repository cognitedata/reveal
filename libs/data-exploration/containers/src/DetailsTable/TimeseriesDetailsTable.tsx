import React, { useMemo } from 'react';
import { InternalTimeseriesData } from '@data-exploration-lib/domain-layer';
import { Table, TableProps } from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

export const TimeseriesDetailsTable = (
  props: Omit<TableProps<InternalTimeseriesData>, 'columns'>
) => {
  const columns = useMemo(
    () => [Table.Columns.name()],
    []
  ) as ColumnDef<InternalTimeseriesData>[];
  return (
    <Table<InternalTimeseriesData>
      columns={columns}
      showLoadButton
      enableSelection
      hideColumnToggle
      {...props}
    />
  );
};

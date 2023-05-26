import React, { useMemo } from 'react';

import { Table, TableProps } from '@data-exploration/components';
import { InternalTimeseriesData } from '@data-exploration-lib/domain-layer';
import { ColumnDef } from '@tanstack/react-table';

import { Wrapper } from './elements';

export const TimeseriesDetailsTable = (
  props: Omit<TableProps<InternalTimeseriesData>, 'columns'>
) => {
  const columns = useMemo(
    () => [Table.Columns.name()],
    []
  ) as ColumnDef<InternalTimeseriesData>[];
  return (
    <Wrapper>
      <Table<InternalTimeseriesData>
        columns={columns}
        showLoadButton
        enableSelection
        hideColumnToggle
        {...props}
      />
    </Wrapper>
  );
};

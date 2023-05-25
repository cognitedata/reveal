import React, { useMemo } from 'react';
import { InternalEventsData } from '@data-exploration-lib/domain-layer';
import { Table, TableProps } from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';
import { Wrapper } from './elements';

export const EventDetailsTable = (
  props: Omit<TableProps<InternalEventsData>, 'columns'>
) => {
  const columns = useMemo(
    () => [Table.Columns.type()],
    []
  ) as ColumnDef<InternalEventsData>[];
  return (
    <Wrapper>
      <Table<InternalEventsData>
        columns={columns}
        showLoadButton
        enableSelection
        hideColumnToggle
        {...props}
      />
    </Wrapper>
  );
};

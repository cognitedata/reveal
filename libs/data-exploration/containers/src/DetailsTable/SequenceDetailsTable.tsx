import React, { useMemo } from 'react';

import { Table, TableProps } from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

import { InternalSequenceData } from '@data-exploration-lib/domain-layer';

import { Wrapper } from './elements';

export const SequenceDetailsTable = (
  props: Omit<TableProps<InternalSequenceData>, 'columns'>
) => {
  const columns = useMemo(
    () => [Table.Columns.name()],
    []
  ) as ColumnDef<InternalSequenceData>[];
  return (
    <Wrapper>
      <Table<InternalSequenceData>
        columns={columns}
        showLoadButton
        enableSelection
        hideColumnToggle
        {...props}
      />
    </Wrapper>
  );
};

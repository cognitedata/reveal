import React, { useMemo } from 'react';

import {
  getTableColumns,
  Table,
  TableProps,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

import { useTranslation } from '@data-exploration-lib/core';
import { InternalSequenceData } from '@data-exploration-lib/domain-layer';

import { Wrapper } from './elements';

export const SequenceDetailsTable = (
  props: Omit<TableProps<InternalSequenceData>, 'columns'>
) => {
  const { t } = useTranslation();

  const tableColumns = getTableColumns(t);

  const columns = useMemo(
    () => [tableColumns.name(), tableColumns.description()],
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

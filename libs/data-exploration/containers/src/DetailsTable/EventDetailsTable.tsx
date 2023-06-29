import React, { useMemo } from 'react';

import {
  getTableColumns,
  Table,
  TableProps,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

import { useTranslation } from '@data-exploration-lib/core';
import { InternalEventsData } from '@data-exploration-lib/domain-layer';

import { Wrapper } from './elements';

export const EventDetailsTable = (
  props: Omit<TableProps<InternalEventsData>, 'columns'>
) => {
  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const columns = useMemo(
    () => [tableColumns.type(), tableColumns.description()],
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

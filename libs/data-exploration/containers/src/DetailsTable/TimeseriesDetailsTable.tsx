import React, { useMemo } from 'react';

import {
  getTableColumns,
  Table,
  TableProps,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

import { useTranslation } from '@data-exploration-lib/core';
import { InternalTimeseriesData } from '@data-exploration-lib/domain-layer';

import { Wrapper } from './elements';

export const TimeseriesDetailsTable = (
  props: Omit<TableProps<InternalTimeseriesData>, 'columns'>
) => {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [getTableColumns(t).name()],
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

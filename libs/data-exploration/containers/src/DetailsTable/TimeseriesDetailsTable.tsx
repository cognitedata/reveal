import React, { useMemo } from 'react';

import {
  getTableColumns,
  Table,
  TableProps,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

import { Timeseries } from '@cognite/sdk';

import { getHiddenColumns, useTranslation } from '@data-exploration-lib/core';
import { InternalTimeseriesData } from '@data-exploration-lib/domain-layer';

import { useTimeseriesMetadataColumns } from '../Search';
import { TimeseriesLastReading } from '../Timeseries';

import { Wrapper } from './elements';

export const TimeseriesDetailsTable = (
  props: Omit<TableProps<InternalTimeseriesData>, 'columns'>
) => {
  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const { metadataColumns, setMetadataKeyQuery } =
    useTimeseriesMetadataColumns();

  const columns = useMemo(() => {
    return [
      tableColumns.name(),
      tableColumns.description(),
      tableColumns.unit(),
      tableColumns.lastUpdatedTime,
      {
        header: 'Last reading',
        accessorKey: 'lastReading',
        cell: ({ row }) => {
          return <TimeseriesLastReading timeseriesId={row.original.id} />;
        },
      },
      tableColumns.created,
      tableColumns.id(),
      tableColumns.isString,
      tableColumns.isStep,
      tableColumns.dataSet,
      ...metadataColumns,
    ] as ColumnDef<Timeseries>[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataColumns]);
  const hiddenColumns = getHiddenColumns(columns, ['name', 'description']);

  return (
    <Wrapper>
      <Table<InternalTimeseriesData>
        columns={columns}
        hiddenColumns={hiddenColumns}
        columnSelectionLimit={4}
        onChangeSearchInput={setMetadataKeyQuery}
        showLoadButton
        enableSelection
        {...props}
      />
    </Wrapper>
  );
};

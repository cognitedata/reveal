import { Timeseries, TimeseriesFilter } from '@cognite/sdk';
import { ColumnDef } from '@tanstack/react-table';
import { useResourceResults } from '@data-exploration-components/containers';

import {
  ResourceTableColumns,
  SummaryCardWrapper,
  Table,
} from '@data-exploration-components/components/Table';
import React, { useMemo } from 'react';
import { convertResourceType } from '@data-exploration-components/types';

import { getSummaryCardItems } from '@data-exploration-components/components/SummaryHeader/utils';
import { SummaryHeader } from '@data-exploration-components/components/SummaryHeader/SummaryHeader';
import { TimeseriesLastReading } from '../TimeseriesLastReading/TimeseriesLastReading';
import { useGetHiddenColumns } from '@data-exploration-components/hooks';
import {
  useTimeseriesMetadataKeys,
  InternalTimeseriesFilters,
} from '@data-exploration-lib/domain-layer';

export const TimeseriesSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick,
}: {
  query?: string;
  filter: InternalTimeseriesFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: Timeseries) => void;
}) => {
  const api = convertResourceType('timeSeries');

  const { isLoading, items } = useResourceResults<Timeseries>(
    api,
    query,
    filter
  );

  const { data: metadataKeys = [] } = useTimeseriesMetadataKeys();

  const metadataColumns = useMemo(() => {
    return metadataKeys.map((key) =>
      ResourceTableColumns.metadata(String(key))
    );
  }, [metadataKeys]);

  const columns = useMemo(() => {
    return [
      Table.Columns.name(query),
      Table.Columns.description(query),
      Table.Columns.unit(query),
      Table.Columns.lastUpdatedTime,
      {
        header: 'Last reading',
        accessorKey: 'lastReading',
        cell: ({ row }) => {
          return <TimeseriesLastReading timeseriesId={row.original.id} />;
        },
      },
      Table.Columns.created,
      Table.Columns.id(query),
      Table.Columns.isString,
      Table.Columns.isStep,
      Table.Columns.dataSet,
      Table.Columns.rootAsset(),
      ...metadataColumns,
    ] as ColumnDef<Timeseries>[];
  }, [query, metadataColumns]);
  const hiddenColumns = useGetHiddenColumns(columns, ['name', 'description']);

  return (
    <SummaryCardWrapper>
      <Table
        id="timeseries-summary-table"
        columns={columns}
        hiddenColumns={hiddenColumns}
        columnSelectionLimit={2}
        data={getSummaryCardItems(items)}
        isDataLoading={isLoading}
        tableHeaders={
          <SummaryHeader
            icon="Timeseries"
            title="Time series"
            onAllResultsClick={onAllResultsClick}
          />
        }
        enableColumnResizing={false}
        onRowClick={onRowClick}
      />
    </SummaryCardWrapper>
  );
};

import React, { useMemo } from 'react';

import {
  SubCellMatchingLabels,
  SummaryCardWrapper,
  Table,
} from '@data-exploration/components';
import { useTimeseriesMetadataColumns } from '@data-exploration/containers';
import { SummaryHeader } from '@data-exploration-components/components/SummaryHeader/SummaryHeader';
import { getSummaryCardItems } from '@data-exploration-components/components/SummaryHeader/utils';
import { ColumnDef } from '@tanstack/react-table';

import { Asset, Timeseries } from '@cognite/sdk';

import {
  getHiddenColumns,
  InternalTimeseriesFilters,
  useGetSearchConfigFromLocalStorage,
} from '@data-exploration-lib/core';
import {
  useTimeseriesSearchResultWithLabelsQuery,
  InternalTimeseriesDataWithMatchingLabels,
} from '@data-exploration-lib/domain-layer';

import { TimeseriesLastReading } from '../TimeseriesLastReading/TimeseriesLastReading';

export const TimeseriesSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick,
  onRootAssetClick,
  isAdvancedFiltersEnabled = false,
}: {
  query?: string;
  filter: InternalTimeseriesFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: Timeseries) => void;
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
  isAdvancedFiltersEnabled?: boolean;
}) => {
  const timeseriesSearchConfig =
    useGetSearchConfigFromLocalStorage('timeSeries');
  const { isLoading, data } = useTimeseriesSearchResultWithLabelsQuery(
    {
      query,
      filter,
    },
    undefined,
    timeseriesSearchConfig
  );

  const { metadataColumns, setMetadataKeyQuery } =
    useTimeseriesMetadataColumns();

  const columns = useMemo(() => {
    return [
      Table.Columns.name(),
      Table.Columns.description(),
      Table.Columns.unit(),
      Table.Columns.lastUpdatedTime,
      {
        header: 'Last reading',
        accessorKey: 'lastReading',
        cell: ({ row }) => {
          return <TimeseriesLastReading timeseriesId={row.original.id} />;
        },
      },
      Table.Columns.created,
      Table.Columns.id(),
      Table.Columns.isString,
      Table.Columns.isStep,
      Table.Columns.dataSet,
      Table.Columns.rootAsset(onRootAssetClick),
      ...metadataColumns,
    ] as ColumnDef<Timeseries>[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataColumns]);
  const hiddenColumns = getHiddenColumns(columns, ['name', 'description']);

  return (
    <SummaryCardWrapper>
      <Table<InternalTimeseriesDataWithMatchingLabels>
        id="timeseries-summary-table"
        columns={columns}
        hiddenColumns={hiddenColumns}
        columnSelectionLimit={2}
        data={getSummaryCardItems(data)}
        isDataLoading={isLoading}
        tableHeaders={
          <SummaryHeader
            icon="Timeseries"
            title="Time series"
            onAllResultsClick={onAllResultsClick}
          />
        }
        renderCellSubComponent={
          isAdvancedFiltersEnabled ? SubCellMatchingLabels : undefined
        }
        enableColumnResizing={false}
        onRowClick={onRowClick}
        onChangeSearchInput={setMetadataKeyQuery}
      />
    </SummaryCardWrapper>
  );
};

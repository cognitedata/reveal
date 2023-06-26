import React, { useMemo } from 'react';

import {
  getTableColumns,
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
  useTranslation,
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
      tableColumns.rootAsset(onRootAssetClick),
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
            title={t('TIMESERIES', 'Time series')}
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

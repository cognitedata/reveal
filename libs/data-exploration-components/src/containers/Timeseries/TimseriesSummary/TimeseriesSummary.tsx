import React, { useMemo } from 'react';

import {
  getTableColumns,
  SubCellMatchingLabels,
  SummaryCardWrapper,
  Table,
} from '@data-exploration/components';
import { useTimeseriesMetadataColumns } from '@data-exploration/containers';
import { ColumnDef } from '@tanstack/react-table';
import uniqBy from 'lodash/uniqBy';

import { Asset, Timeseries } from '@cognite/sdk';

import {
  getHiddenColumns,
  InternalTimeseriesFilters,
  isObjectEmpty,
  isSummaryCardDataCountExceed,
  useDeepMemo,
  useGetSearchConfigFromLocalStorage,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  useTimeseriesSearchResultWithLabelsQuery,
  InternalTimeseriesDataWithMatchingLabels,
  useRelatedTimeseriesQuery,
} from '@data-exploration-lib/domain-layer';

import { SummaryHeader } from '../../../components/SummaryHeader/SummaryHeader';
import { getSummaryCardItems } from '../../../components/SummaryHeader/utils';
import { useUniqueCdfItems } from '../../../hooks';
import { TimeseriesLastReading } from '../TimeseriesLastReading/TimeseriesLastReading';

export const TimeseriesSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick,
  onRootAssetClick,
  showAllResultsWithEmptyFilters = false,
  selectedResourceExternalId: resourceExternalId,
  annotationIds = [],
}: {
  query?: string;
  filter?: InternalTimeseriesFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: Timeseries) => void;
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
  showAllResultsWithEmptyFilters?: boolean;
  selectedResourceExternalId?: string;
  annotationIds?: number[];
}) => {
  const isQueryEnable = isObjectEmpty(filter as any)
    ? showAllResultsWithEmptyFilters
    : true;

  const { data: annotationList = [] } = useUniqueCdfItems<Timeseries>(
    'timeseries',
    annotationIds.map((id) => ({ id })),
    true
  );

  const isAnnotationCountExceed = isSummaryCardDataCountExceed(
    annotationList.length
  );

  const timeseriesSearchConfig =
    useGetSearchConfigFromLocalStorage('timeSeries');
  const { isLoading, data: timeseries } =
    useTimeseriesSearchResultWithLabelsQuery(
      {
        query,
        filter,
      },
      { enabled: isQueryEnable && !isAnnotationCountExceed },
      timeseriesSearchConfig
    );

  const isTimeseriesCountExceed = isSummaryCardDataCountExceed(
    timeseries.length + annotationList.length
  );

  const { data: relatedTimeseries, isLoading: isRelatedTimeseriesLoading } =
    useRelatedTimeseriesQuery({
      resourceExternalId,
      enabled: !isTimeseriesCountExceed,
    });

  const mergeData = useDeepMemo(
    () =>
      uniqBy([...annotationList, ...timeseries, ...relatedTimeseries], 'id'),
    [annotationList, timeseries, relatedTimeseries]
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

  const isDataLoading = isLoading && isQueryEnable && isAnnotationCountExceed;
  const isRelatedDataLoading =
    isRelatedTimeseriesLoading && !isTimeseriesCountExceed;

  return (
    <SummaryCardWrapper data-testid="timeseries-summary">
      <Table<InternalTimeseriesDataWithMatchingLabels>
        id="timeseries-summary-table"
        columns={columns}
        hiddenColumns={hiddenColumns}
        columnSelectionLimit={2}
        data={getSummaryCardItems(mergeData)}
        isDataLoading={isDataLoading || isRelatedDataLoading}
        tableHeaders={
          <SummaryHeader
            icon="Timeseries"
            title={t('TIMESERIES', 'Time series')}
            onAllResultsClick={onAllResultsClick}
          />
        }
        renderCellSubComponent={SubCellMatchingLabels}
        enableColumnResizing={false}
        onRowClick={onRowClick}
        onChangeSearchInput={setMetadataKeyQuery}
      />
    </SummaryCardWrapper>
  );
};

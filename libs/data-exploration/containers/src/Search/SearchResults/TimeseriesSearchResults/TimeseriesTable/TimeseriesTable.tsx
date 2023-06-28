import { useEffect, useMemo, useState } from 'react';

import {
  getTableColumns,
  SubCellMatchingLabels,
  Table,
  TableProps,
  TimeDisplay,
} from '@data-exploration/components';
import { ColumnDef } from '@tanstack/react-table';

import { TimeseriesChart } from '@cognite/plotting-components';
import { Asset, Timeseries } from '@cognite/sdk';

import {
  DateRangeProps,
  getHiddenColumns,
  RelationshipLabels,
  TIME_SELECT,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  InternalTimeseriesDataWithMatchingLabels,
  TimeseriesWithRelationshipLabels,
} from '@data-exploration-lib/domain-layer';

import { useTimeseriesMetadataColumns } from '../useTimeseriesMetadataColumns';

export interface TimeseriesTableProps
  extends Omit<
      TableProps<TimeseriesWithRelationshipLabels | Timeseries>,
      'columns'
    >,
    RelationshipLabels,
    DateRangeProps {
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
}
const visibleColumns = ['name', 'description', 'data', 'lastUpdatedTime'];
export const TimeseriesTable = ({
  dateRange: dateRangeProp,
  onRootAssetClick,
  query,
  ...props
}: TimeseriesTableProps) => {
  const { data, ...rest } = props;
  const { t } = useTranslation();

  const [dateRange, setDateRange] = useState(
    dateRangeProp || TIME_SELECT['1Y'].getTime()
  );

  const { metadataColumns, setMetadataKeyQuery } =
    useTimeseriesMetadataColumns();

  useEffect(() => {
    if (dateRangeProp) {
      setDateRange(dateRangeProp);
    }
  }, [dateRangeProp]);

  const startTime = dateRange[0].getTime();
  const endTime = dateRange[1].getTime();
  const tableColumns = getTableColumns(t);

  const sparkLineColumn: ColumnDef<Timeseries & { data: any }> = useMemo(
    () => ({
      header: t('TIMESERIES_PREVIEW', 'Preview'),
      accessorKey: 'data',
      size: 400,
      enableSorting: false,
      cell: ({ row }) => {
        const timeseries = row.original;

        return (
          <TimeseriesChart
            timeseriesId={timeseries.id}
            variant="small"
            dateRange={dateRange}
            numberOfPoints={100}
            height={55}
            dataFetchOptions={{
              mode: 'aggregate',
            }}
            autoRange
          />
        );
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startTime, endTime]
  );

  const columns = useMemo(() => {
    return [
      {
        ...tableColumns.name(query),
        enableHiding: false,
      },
      tableColumns.description(query),
      tableColumns.externalId(query),
      {
        ...tableColumns.unit(query),
        enableSorting: false,
      },
      sparkLineColumn,
      tableColumns.lastUpdatedTime,
      {
        header: t('LAST_READING', 'Last reading'),
        accessorKey: 'lastReading',
        cell: ({ row }) => {
          const lastReadingDate = row.original.latestDatapointDate
            ? new Date(row.original.latestDatapointDate)
            : undefined;
          return <TimeDisplay value={lastReadingDate} relative withTooltip />;
        },
        enableSorting: false,
      },
      tableColumns.created,
      {
        ...tableColumns.id(query),
        enableSorting: false,
      },
      {
        ...tableColumns.isString,
        enableSorting: false,
      },
      {
        ...tableColumns.isStep,
        enableSorting: false,
      },
      {
        ...tableColumns.dataSet,
        enableSorting: true,
      },
      tableColumns.rootAsset(onRootAssetClick),
      tableColumns.assets(onRootAssetClick),
      ...metadataColumns,
    ] as ColumnDef<TimeseriesWithRelationshipLabels>[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sparkLineColumn, metadataColumns]);

  const hiddenColumns = getHiddenColumns(columns, visibleColumns);

  return (
    <Table<InternalTimeseriesDataWithMatchingLabels>
      columns={columns}
      data={data}
      hiddenColumns={hiddenColumns}
      renderCellSubComponent={SubCellMatchingLabels}
      onChangeSearchInput={setMetadataKeyQuery}
      {...rest}
    />
  );
};

import { useEffect, useMemo, useState } from 'react';
import { Asset, Timeseries } from '@cognite/sdk';
import {
  DateRangeProps,
  RelationshipLabels,
} from '@data-exploration-components/types';
import {
  SubCellMatchingLabels,
  Table,
  TableProps,
  TimeDisplay,
} from '@data-exploration/components';
import { TIME_SELECT } from '@data-exploration-components/containers';
import { ColumnDef } from '@tanstack/react-table';
import { useGetHiddenColumns } from '@data-exploration-components/hooks';
import {
  InternalTimeseriesDataWithMatchingLabels,
  TimeseriesWithRelationshipLabels,
} from '@data-exploration-lib/domain-layer';

import { TimeseriesChart } from '@cognite/plotting-components';
import { useTimeseriesMetadataColumns } from '../hooks/useTimeseriesMetadataColumns';

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

  const sparkLineColumn: ColumnDef<Timeseries & { data: any }> = useMemo(
    () => ({
      header: 'Preview',
      accessorKey: 'data',
      size: 400,
      enableSorting: false,
      cell: ({ row }) => {
        const timeseries = row.original;

        return (
          <TimeseriesChart
            timeseriesId={timeseries.id}
            isString={timeseries.isString}
            variant="small"
            dateRange={dateRange}
            numberOfPoints={100}
            height={55}
            dataFetchOptions={{
              mode: 'aggregate',
            }}
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
        ...Table.Columns.name(query),
        enableHiding: false,
      },
      Table.Columns.description(query),
      Table.Columns.externalId(query),
      {
        ...Table.Columns.unit(query),
        enableSorting: false,
      },
      sparkLineColumn,
      Table.Columns.lastUpdatedTime,
      {
        header: 'Last reading',
        accessorKey: 'lastReading',
        cell: ({ row }) => {
          const lastReadingDate = row.original.latestDatapointDate
            ? new Date(row.original.latestDatapointDate)
            : undefined;
          return <TimeDisplay value={lastReadingDate} relative withTooltip />;
        },
        enableSorting: false,
      },
      Table.Columns.created,
      {
        ...Table.Columns.id(query),
        enableSorting: false,
      },
      {
        ...Table.Columns.isString,
        enableSorting: false,
      },
      {
        ...Table.Columns.isStep,
        enableSorting: false,
      },
      {
        ...Table.Columns.dataSet,
        enableSorting: true,
      },
      Table.Columns.rootAsset(onRootAssetClick),
      Table.Columns.assets(onRootAssetClick),
      ...metadataColumns,
    ] as ColumnDef<TimeseriesWithRelationshipLabels>[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sparkLineColumn, metadataColumns]);

  const hiddenColumns = useGetHiddenColumns(columns, visibleColumns);

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

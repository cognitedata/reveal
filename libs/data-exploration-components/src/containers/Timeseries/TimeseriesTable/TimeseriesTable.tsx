import { useEffect, useMemo, useState } from 'react';
import { Asset, Timeseries } from '@cognite/sdk';
import {
  DateRangeProps,
  RelationshipLabels,
} from '@data-exploration-components/types';
import {
  Table,
  TableProps,
} from '@data-exploration-components/components/Table/Table';
import { TIME_SELECT } from '@data-exploration-components/containers';
import { TimeseriesChart } from '..';
import { Body } from '@cognite/cogs.js';
import { ColumnDef, Row } from '@tanstack/react-table';
import { useGetHiddenColumns } from '@data-exploration-components/hooks';
import isEmpty from 'lodash/isEmpty';
import { ResourceTableColumns, SubRowMatchingLabel } from '../../../components';
import {
  InternalTimeseriesDataWithMatchingLabels,
  useTimeseriesMetadataKeys,
} from '@data-exploration-lib/domain-layer';
import { SubCellMatchingLabels } from '../../../components/Table/components/SubCellMatchingLabel';
import { TimeseriesLastReading } from '../TimeseriesLastReading/TimeseriesLastReading';

export type TimeseriesWithRelationshipLabels = Timeseries & RelationshipLabels;

export interface TimeseriesTableProps
  extends Omit<TableProps<TimeseriesWithRelationshipLabels>, 'columns'>,
    RelationshipLabels,
    DateRangeProps {
  hideEmptyData?: boolean;
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
}
const visibleColumns = ['name', 'description', 'data', 'lastUpdatedTime'];
export const TimeseriesTable = ({
  dateRange: dateRangeProp,
  hideEmptyData = false,
  onRootAssetClick,
  ...props
}: TimeseriesTableProps) => {
  const { data, ...rest } = props;
  const { data: metadataKeys = [] } = useTimeseriesMetadataKeys();

  const [dateRange, setDateRange] = useState(
    dateRangeProp || TIME_SELECT['1Y'].getTime()
  );
  const [emptyTimeseriesMap, setEmptyTimeseriesMap] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    if (dateRangeProp) {
      setDateRange(dateRangeProp);
    }
  }, [dateRangeProp]);

  useEffect(() => {
    const emptyTimeseriesMap = data.reduce(
      (emptyTimeseriesMap, { id }) => ({
        ...emptyTimeseriesMap,
        [id]: false,
      }),
      {} as Record<number, boolean>
    );
    setEmptyTimeseriesMap(emptyTimeseriesMap);
  }, [data]);

  const metadataColumns = useMemo(() => {
    return metadataKeys.map((key) =>
      ResourceTableColumns.metadata(String(key))
    );
  }, [metadataKeys]);

  const columns = useMemo(() => {
    const sparkLineColumn: ColumnDef<Timeseries & { data: any }> = {
      header: 'Preview',
      accessorKey: 'data',
      size: 400,
      enableSorting: false,
      cell: ({ row }) => {
        const timeseries = row.original;
        if (timeseries.isString) {
          return <Body level={2}>N/A for string time series</Body>;
        }
        return (
          <TimeseriesChart
            height={100}
            showSmallerTicks
            timeseriesId={timeseries.id}
            numberOfPoints={100}
            showAxis="horizontal"
            timeOptions={[]}
            showContextGraph={false}
            showPoints={false}
            enableTooltip={false}
            showGridLine="none"
            minRowTicks={2}
            enableTooltipPreview
            dateRange={dateRange}
            onDateRangeChange={() => {}}
            onDataFetched={(data) =>
              setEmptyTimeseriesMap((emptyTimeseriesMap) => ({
                ...emptyTimeseriesMap,
                [timeseries.id]: isEmpty(data?.datapoints),
              }))
            }
          />
        );
      },
    };
    return [
      {
        ...Table.Columns.name(),
        enableHiding: false,
      },
      Table.Columns.description(),
      Table.Columns.externalId(),
      {
        ...Table.Columns.unit(),
        enableSorting: false,
      },
      sparkLineColumn,
      Table.Columns.lastUpdatedTime,
      {
        header: 'Last reading',
        accessorKey: 'lastReading',
        cell: ({ row }) => {
          return <TimeseriesLastReading timeseriesId={row.original.id} />;
        },
        enableSorting: false,
      },
      Table.Columns.created,
      {
        ...Table.Columns.id(),
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
        ...Table.Columns.dataset,
        enableSorting: false,
      },
      Table.Columns.rootAsset(onRootAssetClick),
      Table.Columns.assets(onRootAssetClick),
      ...metadataColumns,
    ] as ColumnDef<Timeseries>[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataColumns, dateRange]);

  const hiddenColumns = useGetHiddenColumns(columns, visibleColumns);

  const timeseriesWithDatapoints = useMemo(() => {
    return data.filter(({ id }) => !emptyTimeseriesMap[id]);
  }, [data, emptyTimeseriesMap]);

  return (
    <Table<InternalTimeseriesDataWithMatchingLabels>
      columns={columns}
      data={hideEmptyData ? timeseriesWithDatapoints : data}
      hiddenColumns={hiddenColumns}
      renderCellSubComponent={SubCellMatchingLabels}
      {...rest}
    />
  );
};

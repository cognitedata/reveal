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
// import { TimeseriesChart } from '..';
import { ColumnDef } from '@tanstack/react-table';
import { useGetHiddenColumns } from '@data-exploration-components/hooks';
import { ResourceTableColumns, TimeDisplay } from '../../../components';
import {
  InternalTimeseriesDataWithMatchingLabels,
  useTimeseriesMetadataKeys,
} from '@data-exploration-lib/domain-layer';
import { SubCellMatchingLabels } from '../../../components/Table/components/SubCellMatchingLabel';
// import noop from 'lodash/noop';
// import { EMPTY_ARRAY } from '@data-exploration-lib/core';

import { TimeseriesChart } from '@cognite/plotting-components';

export type TimeseriesWithRelationshipLabels =
  InternalTimeseriesDataWithMatchingLabels & RelationshipLabels;

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
  ...props
}: TimeseriesTableProps) => {
  const { data, ...rest } = props;
  const { data: metadataKeys = [] } = useTimeseriesMetadataKeys();

  const [dateRange, setDateRange] = useState(
    dateRangeProp || TIME_SELECT['1Y'].getTime()
  );

  useEffect(() => {
    if (dateRangeProp) {
      setDateRange(dateRangeProp);
    }
  }, [dateRangeProp]);

  const metadataColumns = useMemo(() => {
    return metadataKeys.map((key) =>
      ResourceTableColumns.metadata(String(key))
    );
  }, [metadataKeys]);

  const startTime = dateRange[0].getTime();
  const endTime = dateRange[1].getTime();

  const columns = useMemo(() => {
    const sparkLineColumn: ColumnDef<Timeseries & { data: any }> = {
      header: 'Preview',
      accessorKey: 'data',
      size: 400,
      enableSorting: false,
      cell: ({ row }) => {
        const timeseries = row.original;

        // return (
        //   <TimeseriesChart
        //     height={50}
        //     showSmallerTicks
        //     timeseriesId={timeseries.id}
        //     numberOfPoints={100}
        //     showAxis="horizontal"
        //     timeOptions={EMPTY_ARRAY}
        //     showContextGraph={false}
        //     showPoints={false}
        //     enableTooltip={false}
        //     showGridLine="none"
        //     minRowTicks={2}
        //     enableTooltipPreview
        //     dateRange={dateRange}
        //     margin={{ top: 0, right: 0, bottom: 25, left: 0 }}
        //     onDateRangeChange={noop}
        //   />
        // );
        return (
          <TimeseriesChart
            timeseriesId={timeseries.id}
            isString={timeseries.isString}
            variant="small"
            dateRange={dateRange}
            numberOfPoints={100}
            height={55}
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
          const lastReadingDate = row.original.latestDatapointDate
            ? new Date(row.original.latestDatapointDate)
            : undefined;
          return <TimeDisplay value={lastReadingDate} relative withTooltip />;
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
        ...Table.Columns.dataSet,
        enableSorting: true,
      },
      Table.Columns.rootAsset(onRootAssetClick),
      Table.Columns.assets(onRootAssetClick),
      ...metadataColumns,
    ] as ColumnDef<TimeseriesWithRelationshipLabels>[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataColumns, startTime, endTime]);

  const hiddenColumns = useGetHiddenColumns(columns, visibleColumns);

  return (
    <Table<InternalTimeseriesDataWithMatchingLabels>
      columns={columns}
      data={data}
      hiddenColumns={hiddenColumns}
      renderCellSubComponent={SubCellMatchingLabels}
      {...rest}
    />
  );
};

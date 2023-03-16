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
import { Body } from '@cognite/cogs.js';
import { ColumnDef } from '@tanstack/react-table';
import { useGetHiddenColumns } from '@data-exploration-components/hooks';
import { ResourceTableColumns } from '../../../components';
import {
  InternalTimeseriesDataWithMatchingLabels,
  useTimeseriesMetadataKeys,
} from '@data-exploration-lib/domain-layer';
import { SubCellMatchingLabels } from '../../../components/Table/components/SubCellMatchingLabel';
import { TimeseriesLastReading } from '../TimeseriesLastReading/TimeseriesLastReading';
// import noop from 'lodash/noop';
// import { EMPTY_ARRAY } from '@data-exploration-lib/core';

import { TimeseriesChart } from '@cognite/plotting-components';

export type TimeseriesWithRelationshipLabels = Timeseries & RelationshipLabels;

export interface TimeseriesTableProps
  extends Omit<TableProps<TimeseriesWithRelationshipLabels>, 'columns'>,
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
            variant="small"
            dateRange={dateRange}
            numberOfPoints={100}
            height={50}
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
        ...Table.Columns.dataSet,
        enableSorting: true,
      },
      Table.Columns.rootAsset(onRootAssetClick),
      Table.Columns.assets(onRootAssetClick),
      ...metadataColumns,
    ] as ColumnDef<Timeseries>[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataColumns, dateRange]);

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

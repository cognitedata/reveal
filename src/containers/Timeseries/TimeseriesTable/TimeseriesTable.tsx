import React from 'react';
import { Timeseries } from '@cognite/sdk';
import { Table, TableProps } from 'components';
import { TimeseriesChart } from 'containers/Timeseries';
import { Body } from '@cognite/cogs.js';
import { DateRangeProps, RelationshipLabels } from 'types';
import { TIME_SELECT } from 'containers';
import { getColumnsWithRelationshipLabels } from 'utils';
import { TimeseriesLastReading } from '../TimeseriesLastReading/TimeseriesLastReading';

const sparkLineColumn = ([startTime, endTime]: [Date, Date]) => {
  return {
    title: 'Data',
    key: 'data',
    width: 400,
    startTime: startTime.valueOf(),
    endTime: endTime.valueOf(),
    cellRenderer: ({
      rowData: timeseries,
      column: { startTime: start, endTime: end },
    }: {
      rowData: Timeseries;
      column: {
        startTime: number;
        endTime: number;
      };
    }) => {
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
          dateRange={[new Date(start), new Date(end)]}
          onDateRangeChange={() => {}}
        />
      );
    },
  };
};

const lastReadingColumn = () => {
  return {
    title: 'Last reading',
    key: 'last-reading',
    width: 200,
    cellRenderer: ({ rowData: timeseries }: { rowData: Timeseries }) => {
      return <TimeseriesLastReading timeseriesId={timeseries.id} />;
    },
  };
};

export type TimeseriesWithRelationshipLabels = Timeseries & RelationshipLabels;
export const TimeseriesTable = ({
  dateRange = TIME_SELECT['1Y'].getTime(),
  ...props
}: TableProps<TimeseriesWithRelationshipLabels> & DateRangeProps) => {
  const { relatedResourceType } = props;

  const columns = React.useMemo(
    () => [
      { ...Table.Columns.name, lines: 3 },
      { ...Table.Columns.description, lines: 3 },
      Table.Columns.externalId,
      Table.Columns.unit,
      sparkLineColumn(dateRange),
      Table.Columns.relationships,
      lastReadingColumn(),
      Table.Columns.lastUpdatedTime,
      Table.Columns.createdTime,
    ],
    [dateRange]
  );

  const updatedColumns = React.useMemo(
    () =>
      getColumnsWithRelationshipLabels(
        columns,
        relatedResourceType === 'relationship'
      ),
    [columns, relatedResourceType]
  );

  return (
    <Table<Timeseries>
      columns={updatedColumns}
      rowHeight={100}
      {...props}
      dateRange={dateRange}
    />
  );
};

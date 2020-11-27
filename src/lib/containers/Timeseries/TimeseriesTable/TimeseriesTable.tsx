import React from 'react';
import { Timeseries } from '@cognite/sdk';
import { Table, TableProps } from 'lib/components';
import { TimeseriesChart } from 'lib/containers/Timeseries';
import { Body } from '@cognite/cogs.js';
import { DateRangeProps } from 'lib/CommonProps';
import { TIME_SELECT } from 'lib/containers';

export const TimeseriesTable = ({
  dateRange = TIME_SELECT['1Y'].getTime(),
  ...props
}: TableProps<Timeseries> & DateRangeProps) => {
  const startTime = dateRange[0];
  const endTime = dateRange[1];
  const sparkLineColumn = {
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
          timeseriesId={timeseries.id}
          numberOfPoints={100}
          showAxis="none"
          timeOptions={[]}
          showContextGraph={false}
          showPoints={false}
          enableTooltip={false}
          showGridLine="none"
          minRowTicks={2}
          dateRange={[new Date(start), new Date(end)]}
          onDateRangeChange={() => {}}
        />
      );
    },
  };
  const columns = [
    { ...Table.Columns.name, lines: 3 },
    { ...Table.Columns.description, lines: 3 },
    Table.Columns.externalId,
    Table.Columns.unit,
    sparkLineColumn,
    Table.Columns.relationships,
    Table.Columns.lastUpdatedTime,
    Table.Columns.createdTime,
  ];

  return (
    <Table<Timeseries>
      columns={columns}
      rowHeight={100}
      {...props}
      dateRange={dateRange}
    />
  );
};

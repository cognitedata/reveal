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
  const columns = [
    Table.Columns.name,
    Table.Columns.description,
    Table.Columns.externalId,
    Table.Columns.unit,
    Table.Columns.relationships,
    Table.Columns.lastUpdatedTime,
    Table.Columns.createdTime,
    {
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
    },
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

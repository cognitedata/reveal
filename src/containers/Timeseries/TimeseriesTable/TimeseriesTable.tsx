import React from 'react';
import { Timeseries } from '@cognite/sdk';
import { Table, TableProps } from 'components';
import { TimeseriesChart } from 'containers/Timeseries';
import { Body } from '@cognite/cogs.js';
import { DateRangeProps } from 'CommonProps';
import { TIME_SELECT } from 'containers';
import { RelationshipLabels } from 'types';
import { getColumnsWithRelationshipLabels } from 'utils';

export type TimeseriesWithRelationshipLabels = Timeseries & RelationshipLabels;
export const TimeseriesTable = ({
  dateRange = TIME_SELECT['1Y'].getTime(),
  ...props
}: TableProps<TimeseriesWithRelationshipLabels> & DateRangeProps) => {
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
          dateRange={[new Date(start), new Date(end)]}
          onDateRangeChange={() => {}}
        />
      );
    },
  };

  const { relatedResourceType } = props;

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
  const updatedColumns = getColumnsWithRelationshipLabels(
    columns,
    relatedResourceType === 'relationship'
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

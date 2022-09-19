import { Timeseries } from '@cognite/sdk';
import React from 'react';
import { DateRangeProps, RelationshipLabels } from 'types';
import { NewTable as Table, TableProps } from 'components/ReactTable/Table';
import { TIME_SELECT } from 'containers';
import { TimeseriesChart } from '..';
import { Body } from '@cognite/cogs.js';
import { Column } from 'react-table';
import { getNewColumnsWithRelationshipLabels } from 'utils';

export type TimeseriesWithRelationshipLabels = Timeseries & RelationshipLabels;

export const TimeseriesTable = ({
  dateRange = TIME_SELECT['1Y'].getTime(),
  ...props
}: TableProps<TimeseriesWithRelationshipLabels> &
  RelationshipLabels &
  DateRangeProps) => {
  const startTime = dateRange[0];
  const endTime = dateRange[1];
  const start = startTime.valueOf();
  const end = endTime.valueOf();
  const sparkLineColumn: Column<Timeseries & { data: any }> = {
    Header: 'Data',
    accessor: 'data',
    width: 400,

    Cell: ({ row }) => {
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
          dateRange={[new Date(start), new Date(end)]}
          onDateRangeChange={() => {}}
        />
      );
    },
  };

  const { relatedResourceType = '' } = props;
  const columns = [
    Table.Columns.name,
    Table.Columns.description,
    Table.Columns.unit,
    sparkLineColumn,
    Table.Columns.lastUpdatedTime,
    Table.Columns.created,
    Table.Columns.id,
    Table.Columns.isString,
    Table.Columns.isStep,
    Table.Columns.dataSet,
    Table.Columns.assets,
  ] as Column<TimeseriesWithRelationshipLabels>[];

  const updatedColumns = getNewColumnsWithRelationshipLabels(
    columns,
    relatedResourceType === 'relationship'
  );

  return (
    <Table
      columns={updatedColumns}
      data={props.data}
      visibleColumns={['name', 'description', 'data', 'lastUpdatedTime']}
    />
  );
};

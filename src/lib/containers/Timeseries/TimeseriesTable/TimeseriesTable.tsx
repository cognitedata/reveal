import React from 'react';
import { Timeseries } from '@cognite/sdk';
import { Table, TableProps } from 'lib/components';
import { TimeseriesChart } from 'lib/containers/Timeseries';
import { Body } from '@cognite/cogs.js';

export const TimeseriesTable = ({
  items,
  onItemClicked,
  ...props
}: {
  items: Timeseries[];
  onItemClicked: (sequence: Timeseries) => void;
} & TableProps<Timeseries>) => {
  const columns = [
    Table.Columns.name,
    Table.Columns.externalId,
    Table.Columns.unit,
    Table.Columns.relationships,
    Table.Columns.lastUpdatedTime,
    Table.Columns.createdTime,
    {
      title: 'Data (Last 1 Year)',
      key: 'data',
      width: 400,
      cellRenderer: ({ rowData: timeseries }: { rowData: Timeseries }) => {
        if (timeseries.isString) {
          return <Body level={2}>N/A for string time series</Body>;
        }
        return (
          <TimeseriesChart
            height={100}
            timeseriesId={timeseries.id}
            numberOfPoints={100}
            showAxis="none"
            timeOptions={['1Y']}
            showContextGraph={false}
            showPoints={false}
            enableTooltip={false}
            showGridLine="none"
          />
        );
      },
    },
  ];

  return (
    <Table<Timeseries>
      data={items}
      columns={columns}
      onRowClick={onItemClicked}
      rowHeight={100}
      {...props}
    />
  );
};

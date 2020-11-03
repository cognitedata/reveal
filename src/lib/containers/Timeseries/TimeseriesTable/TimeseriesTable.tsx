import React from 'react';
import { Timeseries } from '@cognite/sdk';
import { useSelectionCheckbox } from 'lib/hooks/useSelection';
import { useResourceMode } from 'lib/context';
import { Table, TableProps } from 'lib/components';
import { TimeseriesChart } from 'lib/containers/Timeseries';
import { Body } from '@cognite/cogs.js';

const ActionCell = ({ timeseries }: { timeseries: Timeseries }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: timeseries.id, type: 'timeSeries' });
};

export const TimeseriesTable = ({
  items,
  onItemClicked,
  ...props
}: {
  items: Timeseries[];
  onItemClicked: (sequence: Timeseries) => void;
} & TableProps<Timeseries>) => {
  const { mode } = useResourceMode();

  const columns = [
    Table.Columns.name,
    Table.Columns.externalId,
    Table.Columns.unit,
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
    ...(mode !== 'none'
      ? [
          {
            ...Table.Columns.select,
            cellRenderer: ({
              rowData: timeseries,
            }: {
              rowData: Timeseries;
            }) => {
              return <ActionCell timeseries={timeseries} />;
            },
          },
        ]
      : []),
  ];

  return (
    <Table<Timeseries>
      data={items}
      columns={columns}
      onRowClick={onItemClicked}
      rowHeight={100}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
};

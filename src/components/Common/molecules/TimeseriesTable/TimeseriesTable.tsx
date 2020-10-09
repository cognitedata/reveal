import React from 'react';
import { Timeseries } from '@cognite/sdk';
import { useSelectionCheckbox } from 'hooks/useSelection';
import { useResourceMode } from 'context/ResourceSelectionContext';
import { Table, TableProps } from 'components/Common';

const ActionCell = ({ sequence }: { sequence: Timeseries }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: sequence.id, type: 'timeSeries' });
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
    ...(mode !== 'none'
      ? [
          {
            ...Table.Columns.select,
            cellRenderer: ({ rowData: sequence }: { rowData: Timeseries }) => {
              return <ActionCell sequence={sequence} />;
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
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
};

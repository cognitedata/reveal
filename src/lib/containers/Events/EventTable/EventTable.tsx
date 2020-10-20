import React from 'react';
import { CogniteEvent } from '@cognite/sdk';
import { useResourceMode } from 'lib/context';
import { useSelectionCheckbox } from 'lib/hooks/useSelection';
import { Table, TableProps } from 'lib/components';

const ActionCell = ({ event }: { event: CogniteEvent }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: event.id, type: 'event' });
};

export const EventTable = ({
  items,
  onItemClicked,
  ...props
}: {
  items: CogniteEvent[];
  onItemClicked: (event: CogniteEvent) => void;
} & TableProps<CogniteEvent>) => {
  const { mode } = useResourceMode();

  const columns = [
    Table.Columns.type,
    Table.Columns.subtype,
    Table.Columns.description,
    Table.Columns.externalId,
    Table.Columns.lastUpdatedTime,
    Table.Columns.createdTime,
    ...(mode !== 'none'
      ? [
          {
            ...Table.Columns.select,
            cellRenderer: ({ rowData: event }: { rowData: CogniteEvent }) => {
              return <ActionCell event={event} />;
            },
          },
        ]
      : []),
  ];

  return (
    <Table<CogniteEvent>
      data={items}
      columns={columns}
      onRowClick={onItemClicked}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
};

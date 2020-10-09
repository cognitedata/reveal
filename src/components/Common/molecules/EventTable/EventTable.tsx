import React from 'react';
import { CogniteEvent } from '@cognite/sdk';
import { useSelectionCheckbox } from 'hooks/useSelection';
import { useResourceMode } from 'context/ResourceSelectionContext';
import { Table, TableProps } from 'components/Common';

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
            ...Table.Columns.createdTime,
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

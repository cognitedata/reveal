import React from 'react';
import { CogniteEvent } from '@cognite/sdk';
import { useSelectionCheckbox } from 'hooks/useSelection';
import { useResourceMode } from 'context/ResourceSelectionContext';
import { ResourceTable, ResourceTableColumns } from 'components/Common';

const ActionCell = ({ event }: { event: CogniteEvent }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: event.id, type: 'event' });
};

export const EventTable = ({
  query,
  filter,
  onEventClicked,
}: {
  query?: string;
  filter?: any;
  onEventClicked: (event: CogniteEvent) => void;
}) => {
  const { mode } = useResourceMode();

  const columns = [
    ResourceTableColumns.type,
    ResourceTableColumns.subtype,
    ResourceTableColumns.description,
    ResourceTableColumns.externalId,
    ResourceTableColumns.lastUpdatedTime,
    ResourceTableColumns.createdTime,
    ...(mode !== 'none'
      ? [
          {
            ...ResourceTableColumns.createdTime,
            cellRenderer: ({ rowData: event }: { rowData: CogniteEvent }) => {
              return <ActionCell event={event} />;
            },
          },
        ]
      : []),
  ];

  return (
    <ResourceTable<CogniteEvent>
      api="events"
      query={query}
      filter={filter}
      columns={columns}
      onRowClick={onEventClicked}
    />
  );
};

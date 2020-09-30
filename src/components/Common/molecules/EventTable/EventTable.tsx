import React, { useState } from 'react';
import { CogniteEvent } from 'cognite-sdk-v3';
import { Column } from 'react-base-table';
import { Body } from '@cognite/cogs.js';
import { useSelectionCheckbox } from 'hooks/useSelection';
import {
  useResourceMode,
  useResourcesState,
} from 'context/ResourceSelectionContext';
import { Table, TimeDisplay } from 'components/Common';

const ActionCell = ({ event }: { event: CogniteEvent }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: event.id, type: 'event' });
};

export const EventTable = ({
  events,
  query,
  onEventClicked,
}: {
  events: CogniteEvent[];
  query?: string;
  onEventClicked: (event: CogniteEvent) => void;
}) => {
  const [previewId, setPreviewId] = useState<number | undefined>(undefined);
  const { mode } = useResourceMode();
  const { resourcesState } = useResourcesState();

  const currentItems = resourcesState.filter(el => el.state === 'active');

  const onEventSelected = (event: CogniteEvent) => {
    onEventClicked(event);
    setPreviewId(event.id);
  };

  return (
    <Table<CogniteEvent>
      rowEventHandlers={{
        onClick: ({ rowData: event, event: ev }) => {
          onEventSelected(event);
          return ev;
        },
      }}
      query={query}
      previewingIds={previewId ? [previewId] : undefined}
      activeIds={currentItems.map(el => el.id)}
      columns={[
        {
          key: 'type',
          title: 'Type',
          dataKey: 'type',
          width: 200,
          frozen: Column.FrozenDirection.LEFT,
        },
        {
          key: 'subtype',
          title: 'Subtype',
          dataKey: 'subtype',
          width: 200,
        },
        {
          key: 'description',
          title: 'Description',
          dataKey: 'description',
          width: 200,
        },
        {
          key: 'externalId',
          title: 'External ID',
          dataKey: 'externalId',
          width: 200,
        },
        {
          key: 'lastUpdatedTime',
          title: 'Last updated',
          dataKey: 'lastUpdatedTime',
          width: 200,
          cellRenderer: ({
            cellData: lastUpdatedTime,
          }: {
            cellData?: number;
          }) => (
            <Body level={2}>
              <TimeDisplay value={lastUpdatedTime} relative withTooltip />
            </Body>
          ),
        },
        {
          key: 'createdTime',
          title: 'Created',
          dataKey: 'createdTime',
          width: 200,
          cellRenderer: ({ cellData: createdTime }: { cellData?: number }) => (
            <Body level={2}>
              <TimeDisplay value={createdTime} relative withTooltip />
            </Body>
          ),
        },
        ...(mode !== 'none'
          ? [
              {
                key: 'action',
                title: 'Select',
                width: 80,
                align: Column.Alignment.CENTER,
                frozen: Column.FrozenDirection.RIGHT,
                cellRenderer: ({
                  rowData: event,
                }: {
                  rowData: CogniteEvent;
                }) => {
                  return <ActionCell event={event} />;
                },
              },
            ]
          : []),
      ]}
      fixed
      data={events}
    />
  );
};

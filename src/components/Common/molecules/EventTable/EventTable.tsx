import React, { useState } from 'react';
import { CogniteEvent } from 'cognite-sdk-v3';
import Table, { Column } from 'react-base-table';
import { Body } from '@cognite/cogs.js';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useSelectionCheckbox } from 'hooks/useSelection';
import {
  useResourceMode,
  useResourcesState,
} from 'context/ResourceSelectionContext';
import Highlighter from 'react-highlight-words';
import { TableWrapper, TimeDisplay } from 'components/Common';

const headerRenderer = ({
  column: { title },
}: {
  column: { title: string };
}) => (
  <Body level={3} strong>
    {title}
  </Body>
);

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
  const mode = useResourceMode();
  const resourcesState = useResourcesState();

  const currentItems = resourcesState.filter(el => el.state === 'active');

  const onEventSelected = (event: CogniteEvent) => {
    onEventClicked(event);
    setPreviewId(event.id);
  };

  return (
    <TableWrapper>
      <AutoSizer>
        {({ width, height }) => (
          <Table
            rowEventHandlers={{
              onClick: ({ rowData: event, event: ev }) => {
                onEventSelected(event);
                return ev;
              },
            }}
            rowClassName={({ rowData }) => {
              const extraClasses: string[] = [];
              if (previewId === rowData.id) {
                extraClasses.push('previewing');
              }
              if (currentItems.some(el => el.id === rowData.id)) {
                extraClasses.push('active');
              }
              return `row clickable ${extraClasses.join(' ')}`;
            }}
            width={width}
            height={height}
            columns={[
              {
                key: 'type',
                title: 'Type',
                dataKey: 'type',
                width: 200,
                headerRenderer,
                cellRenderer: ({ cellData: type }: { cellData?: string }) => (
                  <Body level={2}>{type}</Body>
                ),
                resizable: true,
                frozen: Column.FrozenDirection.LEFT,
              },
              {
                key: 'subtype',
                title: 'Sub Type',
                dataKey: 'subtype',
                width: 200,
                headerRenderer,
                cellRenderer: ({
                  cellData: subtype,
                }: {
                  cellData?: string;
                }) => <Body level={2}>{subtype}</Body>,
                resizable: true,
              },
              {
                key: 'description',
                title: 'Description',
                dataKey: 'description',
                width: 200,
                headerRenderer,
                cellRenderer: ({
                  cellData: description,
                }: {
                  cellData?: string;
                }) => (
                  <Body level={2}>
                    <Highlighter
                      searchWords={(query || '').split(' ')}
                      textToHighlight={description || ''}
                    />
                  </Body>
                ),
                resizable: true,
              },
              {
                key: 'externalId',
                title: 'External ID',
                dataKey: 'externalId',
                width: 200,
                headerRenderer,
                cellRenderer: ({
                  cellData: externalId,
                }: {
                  cellData?: string;
                }) => <Body level={2}>{externalId}</Body>,
                resizable: true,
              },
              {
                key: 'lastUpdatedTime',
                title: 'Last updated',
                dataKey: 'lastUpdatedTime',
                width: 200,
                headerRenderer,
                cellRenderer: ({
                  cellData: lastUpdatedTime,
                }: {
                  cellData?: number;
                }) => (
                  <Body level={2}>
                    <TimeDisplay value={lastUpdatedTime} relative withTooltip />
                  </Body>
                ),
                resizable: true,
              },
              {
                key: 'createdTime',
                title: 'Created',
                dataKey: 'createdTime',
                width: 200,
                headerRenderer,
                cellRenderer: ({
                  cellData: createdTime,
                }: {
                  cellData?: number;
                }) => (
                  <Body level={2}>
                    <TimeDisplay value={createdTime} relative withTooltip />
                  </Body>
                ),
                resizable: true,
              },
              {
                key: 'labels',
                title: 'Labels',
                width: 200,
                resizable: true,
                headerRenderer,
                cellRenderer: () => <Body level={3}>Coming soon....</Body>,
              },
              ...(mode !== 'none'
                ? [
                    {
                      key: 'action',
                      title: 'Select',
                      width: 80,
                      resizable: true,
                      align: Column.Alignment.CENTER,
                      frozen: Column.FrozenDirection.RIGHT,
                      headerRenderer,
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
        )}
      </AutoSizer>
    </TableWrapper>
  );
};

import React, { useState, useMemo } from 'react';
import { CogniteEvent } from 'cognite-sdk-v3';
import { Column } from 'react-base-table';
import { Body } from '@cognite/cogs.js';
import { useSelectionCheckbox } from 'hooks/useSelection';
import {
  useResourceMode,
  useResourcesState,
} from 'context/ResourceSelectionContext';
import { Table, TimeDisplay, Loader } from 'components/Common';
import { useInfiniteList, useSearch } from 'hooks/sdk';

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
  const [previewId, setPreviewId] = useState<number | undefined>(undefined);
  const { mode } = useResourceMode();
  const { resourcesState } = useResourcesState();

  const currentItems = resourcesState.filter(el => el.state === 'active');

  const onEventSelected = (event: CogniteEvent) => {
    onEventClicked(event);
    setPreviewId(event.id);
  };

  const useSearchApi = query && query.length > 0;

  const {
    data: listData,
    isFetched: listFetched,
    canFetchMore,
    isFetchingMore,
    fetchMore,
  } = useInfiniteList<CogniteEvent>('events', 50, filter, {
    enabled: !useSearchApi,
  });
  const listEvents = useMemo(
    () =>
      listData?.reduce((accl, t) => accl.concat(t.items), [] as CogniteEvent[]),
    [listData]
  );
  const { data: searchFiles, isFetched: searchFetched } = useSearch<
    CogniteEvent
  >('timeseries', query!, 1000, filter, { enabled: useSearchApi });
  const isFetched = listFetched || searchFetched;
  const events = searchFiles || listEvents;

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <Table<CogniteEvent>
      onEndReached={() => {
        if (canFetchMore && !isFetchingMore) {
          fetchMore();
        }
      }}
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

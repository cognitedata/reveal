import React, { useState, useMemo } from 'react';
import { Timeseries } from 'cognite-sdk-v3';
import { Column } from 'react-base-table';
import { Body } from '@cognite/cogs.js';
import { useSelectionCheckbox } from 'hooks/useSelection';
import {
  useResourceMode,
  useResourcesState,
} from 'context/ResourceSelectionContext';
import { Table, TimeDisplay, Loader } from 'components/Common';
import { useInfiniteList, useSearch } from 'hooks/sdk';

const ActionCell = ({ sequence }: { sequence: Timeseries }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: sequence.id, type: 'timeSeries' });
};

export const TimeseriesTable = ({
  filter,
  query,
  onTimeseriesClicked,
}: {
  filter?: any;
  query?: string;
  onTimeseriesClicked: (sequence: Timeseries) => void;
}) => {
  const [previewId, setPreviewId] = useState<number | undefined>(undefined);
  const { mode } = useResourceMode();
  const { resourcesState } = useResourcesState();

  const currentItems = resourcesState.filter(el => el.state === 'active');

  const onTimeseriesSelected = (sequence: Timeseries) => {
    onTimeseriesClicked(sequence);
    setPreviewId(sequence.id);
  };

  const chunkSize = 50;

  const {
    data: listData,
    isFetched: listFetched,
    canFetchMore,
    isFetchingMore,
    fetchMore,
  } = useInfiniteList<Timeseries>('timeseries', chunkSize, filter, {
    enabled: !!filter && !query,
  });
  const listTimeseries = useMemo(
    () =>
      listData?.reduce((accl, t) => accl.concat(t.items), [] as Timeseries[]),
    [listData]
  );

  const { data: searchData, isFetched: searchFetched } = useSearch<Timeseries>(
    'timeseries',
    query!,
    1000,
    filter,
    { enabled: !!query }
  );

  const isFetched = listFetched || searchFetched;
  const timeseries = searchData || listTimeseries;

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <Table<Timeseries>
      onEndReached={() => {
        if (canFetchMore && !isFetchingMore) {
          fetchMore();
        }
      }}
      rowEventHandlers={{
        onClick: ({ rowData: sequence, event }) => {
          onTimeseriesSelected(sequence);
          return event;
        },
      }}
      query={query}
      previewingIds={previewId ? [previewId] : undefined}
      activeIds={currentItems.map(el => el.id)}
      columns={[
        {
          key: 'name',
          title: 'Name',
          dataKey: 'name',
          width: 300,
          frozen: Column.FrozenDirection.LEFT,
        },
        {
          key: 'externalId',
          title: 'External ID',
          dataKey: 'externalId',
          width: 200,
        },
        {
          key: 'unit',
          title: 'Unit',
          dataKey: 'unit',
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
                  rowData: sequence,
                }: {
                  rowData: Timeseries;
                }) => {
                  return <ActionCell sequence={sequence} />;
                },
              },
            ]
          : []),
      ]}
      fixed
      data={timeseries}
    />
  );
};

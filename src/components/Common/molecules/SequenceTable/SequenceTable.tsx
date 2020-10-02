import React, { useState, useMemo } from 'react';
import { Sequence, SequenceColumn } from 'cognite-sdk-v3';
import { Column } from 'react-base-table';
import { Body } from '@cognite/cogs.js';
import { useSelectionCheckbox } from 'hooks/useSelection';
import {
  useResourceMode,
  useResourcesState,
} from 'context/ResourceSelectionContext';
import { Table, TimeDisplay, Loader } from 'components/Common';
import { useInfiniteList, useSearch } from 'hooks/sdk';

const ActionCell = ({ sequence }: { sequence: Sequence }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: sequence.id, type: 'sequence' });
};

export const SequenceTable = ({
  filter,
  query,
  onSequenceClicked,
}: {
  filter?: any;
  query?: string;
  onSequenceClicked: (sequence: Sequence) => void;
}) => {
  const [previewId, setPreviewId] = useState<number | undefined>(undefined);
  const { mode } = useResourceMode();
  const { resourcesState } = useResourcesState();

  const currentItems = resourcesState.filter(el => el.state === 'active');

  const onSequenceSelected = (sequence: Sequence) => {
    onSequenceClicked(sequence);
    setPreviewId(sequence.id);
  };

  const useSearchApi = query && query.length > 0;

  const {
    data: listData,
    isFetched: listFetched,
    canFetchMore,
    isFetchingMore,
    fetchMore,
  } = useInfiniteList<Sequence>('sequences', 50, filter, {
    enabled: !useSearchApi,
  });
  const sequenceList = useMemo(
    () => listData?.reduce((accl, t) => accl.concat(t.items), [] as Sequence[]),
    [listData]
  );
  const { data: searchFiles, isFetched: searchFetched } = useSearch<Sequence>(
    'timeseries',
    query!,
    1000,
    filter,
    { enabled: useSearchApi }
  );
  const isFetched = listFetched || searchFetched;
  const sequences = searchFiles || sequenceList;

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <Table<Sequence>
      onEndReached={() => {
        if (canFetchMore && !isFetchingMore) {
          fetchMore();
        }
      }}
      rowEventHandlers={{
        onClick: ({ rowData: sequence, event }) => {
          onSequenceSelected(sequence);
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
          key: 'columns',
          title: '# of Columns',
          dataKey: 'columns',
          width: 200,
          cellRenderer: ({
            cellData: columns,
          }: {
            cellData: SequenceColumn[];
          }) => <Body level={2}>{columns.length}</Body>,
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
                  rowData: Sequence;
                }) => {
                  return <ActionCell sequence={sequence} />;
                },
              },
            ]
          : []),
      ]}
      fixed
      data={sequences}
    />
  );
};

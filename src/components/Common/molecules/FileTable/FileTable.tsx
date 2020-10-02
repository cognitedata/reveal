import React, { useState, useMemo } from 'react';
import { FileInfo as File, FileInfo } from 'cognite-sdk-v3';
import { Loader, Table, TimeDisplay } from 'components/Common';
import { Column } from 'react-base-table';
import { Body } from '@cognite/cogs.js';
import { useSelectionCheckbox } from 'hooks/useSelection';
import {
  useResourceMode,
  useResourcesState,
} from 'context/ResourceSelectionContext';

import { useInfiniteList, useSearch } from 'hooks/sdk';

const ActionCell = ({ file }: { file: File }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: file.id, type: 'file' });
};

export const FileTable = ({
  query,
  filter,
  onFileClicked,
}: {
  query?: string;
  filter?: any;
  onFileClicked: (file: File) => void;
}) => {
  const [previewId, setPreviewId] = useState<number | undefined>(undefined);

  const { mode } = useResourceMode();
  const { resourcesState } = useResourcesState();

  const currentItems = resourcesState.filter(el => el.state === 'active');

  const onFileSelected = (file: File) => {
    onFileClicked(file);
    setPreviewId(file.id);
  };

  const useSearchApi = query && query.length > 0;

  const {
    data: listData,
    isFetched: listFetched,
    canFetchMore,
    isFetchingMore,
    fetchMore,
  } = useInfiniteList<FileInfo>('files', 50, filter, {
    enabled: !useSearchApi,
  });
  const listFiles = useMemo(
    () => listData?.reduce((accl, t) => accl.concat(t.items), [] as FileInfo[]),
    [listData]
  );
  const { data: searchFiles, isFetched: searchFetched } = useSearch<FileInfo>(
    'timeseries',
    query!,
    1000,
    filter,
    { enabled: useSearchApi }
  );
  const isFetched = listFetched || searchFetched;
  const files = searchFiles || listFiles;

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <Table<FileInfo>
      onEndReached={() => {
        if (canFetchMore && !isFetchingMore) {
          fetchMore();
        }
      }}
      rowEventHandlers={{
        onClick: ({ rowData: file, event }) => {
          onFileSelected(file);
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
          key: 'mimeType',
          title: 'MIME type',
          dataKey: 'mimeType',
          width: 200,
        },
        {
          key: 'uploadedTime',
          title: 'Uploaded',
          width: 200,
          cellRenderer: ({ cellData: file }: { cellData: File }) => (
            <Body level={2}>
              {file && file.uploaded && (
                <TimeDisplay value={file.uploadedTime} relative withTooltip />
              )}
            </Body>
          ),
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
                cellRenderer: ({ rowData: file }: { rowData: File }) => {
                  return <ActionCell file={file} />;
                },
              },
            ]
          : []),
      ]}
      fixed
      data={files}
    />
  );
};

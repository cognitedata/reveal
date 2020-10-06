import React, { useState, useMemo, useEffect } from 'react';
import { FileInfo, Asset, CogniteEvent } from '@cognite/sdk';
import { Body, Icon } from '@cognite/cogs.js';
import { Row } from 'antd';
import { Loader, Table, TimeDisplay } from 'components/Common';
import { ColumnShape, Column } from 'react-base-table';
import { useResourcesState } from 'context/ResourceSelectionContext';

import { useInfiniteList, useSearch, SdkResourceType } from 'hooks/sdk';

type ResourceType = FileInfo | Asset | CogniteEvent;

const PAGE_SIZE = 50;

export const ResourceTable = <T extends ResourceType>({
  api,
  columns,
  query,
  filter,
  onRowClick,
}: {
  api: SdkResourceType;
  query?: string;
  filter?: any;
  columns: ColumnShape<T>[];
  onRowClick: (file: T) => void;
}) => {
  const [searchCount, setSearchCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setSearchCount(PAGE_SIZE);
  }, [query]);
  const [previewId, setPreviewId] = useState<number | undefined>(undefined);

  const { resourcesState } = useResourcesState();
  const currentItems = resourcesState.filter(el => el.state === 'active');

  const onItemSelected = (file: T) => {
    onRowClick(file);
    setPreviewId(file.id);
  };

  const searchEnabled = !!query && query.length > 0;

  const {
    data: listData,
    isFetched: listFetched,
    canFetchMore,
    isFetchingMore,
    fetchMore,
    isFetching: isFetchingList,
  } = useInfiniteList<T>(api, PAGE_SIZE, filter, {
    enabled: !searchEnabled,
  });
  const listItems = useMemo(
    () => listData?.reduce((accl, t) => accl.concat(t.items), [] as T[]),
    [listData]
  );
  const {
    data: searchFiles,
    isFetched: searchFetched,
    refetch,
    isFetching: isSearching,
  } = useSearch<T>(api, query!, searchCount, filter, {
    enabled: searchEnabled,
  });
  const isFetched = listFetched || searchFetched;
  const isFetching = isFetchingList || isSearching;
  const files = searchEnabled ? searchFiles : listItems;

  useEffect(() => {
    if (searchEnabled) {
      refetch();
    }
  }, [searchCount, searchEnabled, refetch]);

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <Table<T>
      onEndReached={() => {
        if (searchEnabled && !isSearching) {
          setSearchCount(searchCount + PAGE_SIZE);
        } else if (canFetchMore && !isFetchingMore) {
          fetchMore();
        }
      }}
      rowEventHandlers={{
        onClick: ({ rowData: file, event }) => {
          onItemSelected(file);
          return event;
        },
      }}
      footerHeight={isFetching ? 20 : 0}
      footerRenderer={
        <Row type="flex" justify="space-around">
          <Icon type="Loading" />
        </Row>
      }
      query={query}
      previewingIds={previewId ? [previewId] : undefined}
      activeIds={currentItems.map(el => el.id)}
      columns={columns}
      fixed
      data={files}
    />
  );
};

export const ResourceTableColumns = {
  name: {
    key: 'name',
    title: 'Name',
    dataKey: 'name',
    width: 300,
    frozen: Column.FrozenDirection.LEFT,
  },
  root: {
    key: 'root',
    title: 'Root asset',
    width: 200,
  },
  type: {
    key: 'type',
    title: 'Type',
    dataKey: 'type',
    width: 200,
    frozen: Column.FrozenDirection.LEFT,
  },
  subtype: {
    key: 'subtype',
    title: 'Subtype',
    dataKey: 'subtype',
    width: 200,
  },
  description: {
    key: 'description',
    title: 'Description',
    dataKey: 'description',
    width: 200,
  },
  externalId: {
    key: 'externalId',
    title: 'External ID',
    dataKey: 'externalId',
    width: 200,
  },
  lastUpdatedTime: {
    key: 'lastUpdatedTime',
    title: 'Last updated',
    dataKey: 'lastUpdatedTime',
    width: 200,
    cellRenderer: ({ cellData: lastUpdatedTime }: { cellData?: number }) => (
      <Body level={2}>
        <TimeDisplay value={lastUpdatedTime} relative withTooltip />
      </Body>
    ),
  },
  unit: {
    key: 'unit',
    title: 'Unit',
    dataKey: 'unit',
    width: 200,
  },
  columns: {
    key: 'columns',
    title: '# of Columns',
    dataKey: 'columns',
    width: 200,
    cellRenderer: ({ cellData: columns }: { cellData: any[] }) => (
      <Body level={2}>{columns.length}</Body>
    ),
  },
  createdTime: {
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
  mimeType: {
    key: 'mimeType',
    title: 'MIME type',
    dataKey: 'mimeType',
    width: 200,
  },
  uploadedTime: {
    key: 'uploadedTime',
    title: 'Uploaded',
    width: 200,
  },
  select: {
    key: 'action',
    title: 'Select',
    width: 80,
    align: Column.Alignment.CENTER,
    frozen: Column.FrozenDirection.RIGHT,
  },
};

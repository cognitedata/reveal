/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import {
  FileInfo,
  Asset,
  CogniteEvent,
  Timeseries,
  Sequence,
} from '@cognite/sdk';
import { Icon } from '@cognite/cogs.js';
import { Row } from 'antd';
import {
  Loader,
  AssetTable,
  FileTable,
  EventTable,
  TimeseriesTable,
  SequenceTable,
} from 'components/Common';
import { useResourcesState } from 'context/ResourceSelectionContext';
import { SdkResourceType } from 'hooks/sdk';
import { useResourceResults } from './hooks';

type ResourceType = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

export const ResourceTable = <T extends ResourceType>({
  api,
  query,
  filter,
  onRowClick,
}: {
  api: SdkResourceType;
  query?: string;
  filter?: any;
  onRowClick: (file: T) => void;
}) => {
  const [previewId, setPreviewId] = useState<number | undefined>(undefined);

  const { resourcesState } = useResourcesState();
  const currentItems = resourcesState.filter(el => el.state === 'active');

  const onItemSelected = (file: T) => {
    onRowClick(file);
    setPreviewId(file.id);
  };
  const {
    canFetchMore,
    isFetchingMore,
    fetchMore,
    isFetched,
    isFetching,
    items,
  } = useResourceResults(api, query, filter);

  if (!isFetched) {
    return <Loader />;
  }

  const previewIds = previewId ? [previewId] : undefined;
  const activeIds = currentItems.map(el => el.id);

  const commonProps = {
    query,
    previewingIds: previewIds,
    activeIds,
    onEndReached: () => {
      if (canFetchMore && !isFetchingMore) {
        fetchMore();
      }
    },
    footerHeight: isFetching ? 20 : 0,
    footerRenderer: (
      <Row type="flex" justify="space-around">
        <Icon type="Loading" />
      </Row>
    ),
  };

  switch (api) {
    case 'assets': {
      return (
        <AssetTable
          items={items as Asset[]}
          onItemClicked={item => onItemSelected(item as T)}
          {...commonProps}
        />
      );
    }
    case 'files': {
      return (
        <FileTable
          items={items as FileInfo[]}
          onItemClicked={item => onItemSelected(item as T)}
          {...commonProps}
        />
      );
    }
    case 'events': {
      return (
        <EventTable
          items={items as CogniteEvent[]}
          onItemClicked={item => onItemSelected(item as T)}
          {...commonProps}
        />
      );
    }
    case 'timeseries': {
      return (
        <TimeseriesTable
          items={items as Timeseries[]}
          onItemClicked={item => onItemSelected(item as T)}
          {...commonProps}
        />
      );
    }
    case 'sequences': {
      return (
        <SequenceTable
          items={items as Sequence[]}
          onItemClicked={item => onItemSelected(item as T)}
          {...commonProps}
        />
      );
    }
  }

  return null;
};

import React, { useMemo, useState } from 'react';
import {
  FileInfo,
  Asset,
  CogniteEvent,
  Timeseries,
  Sequence,
} from '@cognite/sdk';
import { Icon } from '@cognite/cogs.js';
import { SdkResourceType } from '@cognite/sdk-react-query-hooks';
import { Loader, SpacedRow } from 'lib/components';
import { FileTable } from 'lib/containers/Files';
import { AssetTable } from 'lib/containers/Assets';
import { SequenceTable } from 'lib/containers/Sequences';
import { TimeseriesTable } from 'lib/containers/Timeseries';
import { EventTable } from 'lib/containers/Events';
import { SelectableItemsProps } from 'lib/CommonProps';
import { useResourceResults } from './hooks';

type ResourceType = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

// TODO(CDFUX-000) Clean this up to be a wrapper
export const SearchResultTable = <T extends ResourceType>({
  api,
  query,
  filter = {},
  onRowClick,
  isSelected,
  activeIds = [],
  ...selectionProps
}: {
  api: SdkResourceType;
  query?: string;
  filter?: any;
  onRowClick: (file: T) => void;
  activeIds?: number[];
} & SelectableItemsProps) => {
  const [previewId, setPreviewId] = useState<number | undefined>(undefined);

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

  const selectedIds = useMemo(() => {
    return (items || [])
      .filter(el => {
        switch (api) {
          case 'assets':
            return isSelected({ type: 'asset', id: el.id });
          case 'files':
            return isSelected({ type: 'file', id: el.id });
          case 'events':
            return isSelected({ type: 'event', id: el.id });
          case 'sequences':
            return isSelected({ type: 'sequence', id: el.id });
          case 'timeseries':
            return isSelected({ type: 'timeSeries', id: el.id });
        }
        return false;
      })
      .map(el => el.id);
  }, [items, isSelected, api]);

  if (!isFetched) {
    return <Loader />;
  }

  const previewIds = previewId ? [previewId] : undefined;

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
      <SpacedRow>
        <div className="spacer" />
        <Icon type="Loading" />
        <div className="spacer" />
      </SpacedRow>
    ),
    selectedIds,
    ...selectionProps,
  };

  switch (api) {
    case 'assets': {
      return (
        <AssetTable
          items={items as Asset[]}
          onItemClicked={item => onItemSelected(item as T)}
          {...commonProps}
          onRowSelected={item =>
            selectionProps.onSelect({ type: 'asset', id: item.id })
          }
        />
      );
    }
    case 'files': {
      return (
        <FileTable
          items={items as FileInfo[]}
          onItemClicked={item => onItemSelected(item as T)}
          {...commonProps}
          onRowSelected={item =>
            selectionProps.onSelect({ type: 'file', id: item.id })
          }
        />
      );
    }
    case 'events': {
      return (
        <EventTable
          items={items as CogniteEvent[]}
          onItemClicked={item => onItemSelected(item as T)}
          {...commonProps}
          onRowSelected={item =>
            selectionProps.onSelect({ type: 'event', id: item.id })
          }
        />
      );
    }
    case 'timeseries': {
      return (
        <TimeseriesTable
          items={items as Timeseries[]}
          onItemClicked={item => onItemSelected(item as T)}
          {...commonProps}
          onRowSelected={item =>
            selectionProps.onSelect({ type: 'timeSeries', id: item.id })
          }
        />
      );
    }
    case 'sequences': {
      return (
        <SequenceTable
          items={items as Sequence[]}
          onItemClicked={item => onItemSelected(item as T)}
          {...commonProps}
          onRowSelected={item =>
            selectionProps.onSelect({ type: 'sequence', id: item.id })
          }
        />
      );
    }
  }

  return null;
};

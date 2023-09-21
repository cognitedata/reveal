import React, { useState } from 'react';

import {
  AssetSearchResults,
  AssetViewMode,
  EventSearchResults,
  FileSearchResults,
  SequenceSearchResults,
  TimeseriesSearchResults,
} from '@data-exploration/containers';

import { DateRangeProps } from '@data-exploration-lib/core';

import {
  OldResourceFilterProps,
  ResourceItem,
  ResourceType,
  SelectableItemsProps,
} from '../../types';

export const SearchResults = ({
  allowEdit,
  resourceType,
  assetFilter,
  timeseriesFilter,
  isAssetTreeEnabled = true,
  sequenceFilter,
  eventFilter,
  fileFilter,
  onClick,
  ...commonProps
}: {
  resourceType: ResourceType;
  allowEdit?: boolean;
  query?: string;
  activeIds?: number[];
  isAssetTreeEnabled?: boolean;
  onClick: (item: ResourceItem) => void;
} & Required<OldResourceFilterProps> &
  SelectableItemsProps &
  DateRangeProps) => {
  const [assetView, setAssetView] = useState<AssetViewMode>('tree');

  switch (resourceType) {
    case 'asset':
      return (
        <AssetSearchResults
          isTreeEnabled={isAssetTreeEnabled ? true : undefined}
          view={assetView}
          onViewChange={setAssetView}
          onClick={(item) => onClick({ id: item.id, type: 'asset' })}
          onShowAllAssetsClick={(item) =>
            onClick({
              id: item.parentId ? item.parentId : item.id,
              type: 'asset',
            })
          }
          filter={assetFilter}
          {...commonProps}
        />
      );
    case 'file':
      return (
        <FileSearchResults
          filter={fileFilter}
          allowEdit={allowEdit}
          onClick={(item) => onClick({ id: item.id, type: 'file' })}
          {...commonProps}
        />
      );
    case 'sequence':
      return (
        <SequenceSearchResults
          onClick={(item) => onClick({ id: item.id, type: 'sequence' })}
          filter={{
            ...sequenceFilter,
            metadata: Object.entries(sequenceFilter?.metadata || {}).map(
              ([key, value]) => ({ key, value })
            ),
          }}
          {...commonProps}
        />
      );
    case 'timeSeries':
      return (
        <TimeseriesSearchResults
          onClick={(item) => onClick({ id: item.id, type: 'timeSeries' })}
          filter={timeseriesFilter}
          {...commonProps}
        />
      );
    case 'event':
      return (
        <EventSearchResults
          onClick={(item) => onClick({ id: item.id, type: 'event' })}
          filter={eventFilter}
          {...commonProps}
        />
      );
    default:
      return null;
  }
};

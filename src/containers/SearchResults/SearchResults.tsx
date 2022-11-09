import React from 'react';
import {
  ResourceType,
  ResourceItem,
  SelectableItemsProps,
  DateRangeProps,
  OldResourceFilterProps,
} from 'types';
import { FileSearchResults } from './FileSearchResults/FileSearchResults';
import { EventSearchResults } from './EventSearchResults/EventSearchResults';
import { AssetSearchResults } from './AssetSearchResults/AssetSearchResults';
import { SequenceSearchResults } from './SequenceSearchResults/SequenceSearchResults';
import { TimeseriesSearchResults } from './TimeseriesSearchResults/TimeseriesSearchResults';

export const SearchResults = ({
  allowEdit,
  resourceType,
  assetFilter,
  timeseriesFilter,
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
  onClick: (item: ResourceItem) => void;
} & Required<OldResourceFilterProps> &
  SelectableItemsProps &
  DateRangeProps) => {
  switch (resourceType) {
    case 'asset':
      return (
        <AssetSearchResults
          isTreeEnabled
          onClick={item => onClick({ id: item.id, type: 'asset' })}
          filter={{
            ...assetFilter,
            metadata: Object.entries(assetFilter?.metadata || {}).map(
              ([key, value]) => ({ key, value })
            ),
          }}
          {...commonProps}
        />
      );
    case 'file':
      return (
        <FileSearchResults
          filter={{
            ...fileFilter,
            metadata: Object.entries(fileFilter?.metadata || {}).map(
              ([key, value]) => ({ key, value })
            ),
          }}
          allowEdit={allowEdit}
          onClick={item => onClick({ id: item.id, type: 'file' })}
        />
      );
    case 'sequence':
      return (
        <SequenceSearchResults
          onClick={item => onClick({ id: item.id, type: 'sequence' })}
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
          onClick={item => onClick({ id: item.id, type: 'timeSeries' })}
          filter={{
            ...timeseriesFilter,
            metadata: Object.entries(timeseriesFilter?.metadata || {}).map(
              ([key, value]) => ({ key, value })
            ),
          }}
          {...commonProps}
        />
      );
    case 'event':
      return (
        <EventSearchResults
          onClick={item => onClick({ id: item.id, type: 'event' })}
          filter={{
            ...eventFilter,
            metadata: Object.entries(eventFilter?.metadata || {}).map(
              ([key, value]) => ({ key, value })
            ),
          }}
          {...commonProps}
        />
      );
    default:
      return null;
  }
};

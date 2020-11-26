import React from 'react';
import { ResourceType, ResourceItem } from 'lib/types';
import {
  ResourceFilterProps,
  SelectableItemsProps,
  DateRangeProps,
} from 'lib/CommonProps';
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
} & Required<ResourceFilterProps> &
  SelectableItemsProps &
  DateRangeProps) => {
  switch (resourceType) {
    case 'asset':
      return (
        <AssetSearchResults
          onClick={item => onClick({ id: item.id, type: 'asset' })}
          filter={assetFilter}
          {...commonProps}
        />
      );
    case 'file':
      return (
        <FileSearchResults
          filter={fileFilter}
          allowEdit={allowEdit}
          onClick={item => onClick({ id: item.id, type: 'file' })}
          {...commonProps}
        />
      );
    case 'sequence':
      return (
        <SequenceSearchResults
          onClick={item => onClick({ id: item.id, type: 'sequence' })}
          filter={sequenceFilter}
          {...commonProps}
        />
      );
    case 'timeSeries':
      return (
        <TimeseriesSearchResults
          onClick={item => onClick({ id: item.id, type: 'timeSeries' })}
          filter={timeseriesFilter}
          {...commonProps}
        />
      );
    case 'event':
      return (
        <EventSearchResults
          onClick={item => onClick({ id: item.id, type: 'event' })}
          filter={eventFilter}
          {...commonProps}
        />
      );
    default:
      return null;
  }
};

import React from 'react';
import { ResourceType } from 'lib/types';
import { ResourceFilterProps, SelectableItemsProps } from 'lib/CommonProps';
import { AssetSearchResults } from 'lib/containers/Assets';
import { FileSearchResults } from 'lib/containers/Files';
import { SequenceSearchResults } from 'lib/containers/Sequences';
import { TimeseriesSearchResults } from 'lib/containers/Timeseries';
import { EventSearchResults } from 'lib/containers/Events';

export const SearchResults = ({
  resourceType,
  assetFilter,
  timeseriesFilter,
  sequenceFilter,
  eventFilter,
  fileFilter,
  ...commonProps
}: { resourceType: ResourceType; query?: string } & Required<
  ResourceFilterProps
> &
  SelectableItemsProps) => {
  switch (resourceType) {
    case 'asset':
      return <AssetSearchResults filter={assetFilter} {...commonProps} />;
    case 'file':
      return <FileSearchResults filter={fileFilter} {...commonProps} />;
    case 'sequence':
      return <SequenceSearchResults filter={sequenceFilter} {...commonProps} />;
    case 'timeSeries':
      return (
        <TimeseriesSearchResults filter={timeseriesFilter} {...commonProps} />
      );
    case 'event':
      return <EventSearchResults filter={eventFilter} {...commonProps} />;
    default:
      return null;
  }
};

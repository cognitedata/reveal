import React from 'react';

import { ResourceType, ResourceItem, SelectableItemsProps } from 'types';

import { FileSearchResults } from 'containers/SearchResults';
import { AssetLinkedSearchResults } from 'containers/SearchResults/AssetSearchResults/AssetLinkedSearchResults';
import { TimeseriesLinkedSearchResults } from 'containers/SearchResults/TimeseriesSearchResults/TimeseriesLinkedSearchResults';
import { EventLinkedSearchResults } from 'containers/SearchResults/EventSearchResults/EventLinkedSearchResults';
import { SequenceLinkedSearchResults } from 'containers/SearchResults/SequenceSearchResults/SequenceLinkedSearchResults';

export const LinkedResourceTable = ({
  isGroupingFilesEnabled,
  type,
  parentResource,
  onItemClicked,
  ...selectionMode
}: {
  excludeParentResource?: boolean;
  type: ResourceType;
  isGroupingFilesEnabled?: boolean;
  parentResource: ResourceItem;
  onItemClicked: (id: number) => void;
} & SelectableItemsProps) => {
  const filter = { assetSubtreeIds: [{ value: parentResource.id }] };

  switch (type) {
    case 'asset':
      return (
        <AssetLinkedSearchResults
          defaultFilter={filter}
          onClick={row => onItemClicked(row.id)}
        />
      );
    case 'event':
      return (
        <EventLinkedSearchResults
          defaultFilter={filter}
          onClick={el => onItemClicked(el.id)}
        />
      );
    case 'file':
      return (
        <FileSearchResults
          isGroupingFilesEnabled={isGroupingFilesEnabled}
          relatedResourceType="linkedResource"
          parentResource={parentResource}
          filter={filter}
          onClick={el => onItemClicked(el.id)}
          {...selectionMode}
          hideColumnToggle
        />
      );
    case 'sequence':
      return (
        <SequenceLinkedSearchResults
          defaultFilter={filter}
          onClick={el => onItemClicked(el.id)}
        />
      );

    case 'timeSeries':
      return (
        <TimeseriesLinkedSearchResults
          defaultFilter={filter}
          onClick={el => onItemClicked(el.id)}
        />
      );
    default:
      return <>No relationships found</>;
  }
};

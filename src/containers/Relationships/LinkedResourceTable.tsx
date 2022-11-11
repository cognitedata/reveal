import React from 'react';

import { ResourceType, ResourceItem, SelectableItemsProps } from 'types';

import {
  FileSearchResults,
  TimeseriesSearchResults,
} from 'containers/SearchResults';
import { AssetLinkedSearchResults } from 'containers/SearchResults/AssetSearchResults/AssetLinkedSearchResults';
import { SequenceLinkedSearchResults } from 'containers/SearchResults/SequenceSearchResults/SequenceLinkedSearchResults';
import { EventLinkedSearchResults } from 'containers/SearchResults/EventSearchResults/EventLinkedSearchResults';

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
        <TimeseriesSearchResults
          filter={filter}
          onClick={el => onItemClicked(el.id)}
          initialView="grid"
          {...selectionMode}
        />
      );
    default:
      return <>No relationships found</>;
  }
};

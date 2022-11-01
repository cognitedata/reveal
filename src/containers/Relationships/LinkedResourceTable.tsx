import React from 'react';

import { ResourceType, ResourceItem, SelectableItemsProps } from 'types';

import {
  FileSearchResults,
  TimeseriesSearchResults,
  EventSearchResults,
  AssetSearchResults,
  SequenceSearchResults,
} from 'containers/SearchResults';

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
        <AssetSearchResults
          onClick={row => onItemClicked(row.id)}
          filter={filter}
          {...selectionMode}
          hideColumnToggle
        />
      );
    case 'event':
      return (
        <EventSearchResults
          filter={filter}
          onClick={el => onItemClicked(el.id)}
          {...selectionMode}
          hideColumnToggle
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
        <SequenceSearchResults
          filter={filter}
          onClick={el => onItemClicked(el.id)}
          {...selectionMode}
          hideColumnToggle
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

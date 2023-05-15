import {
  AssetLinkedSearchResults,
  EventLinkedSearchResults,
  SequenceLinkedSearchResults,
  TimeseriesLinkedSearchResults,
} from '@data-exploration/containers';
import React from 'react';

import {
  ResourceType,
  ResourceItem,
  SelectableItemsProps,
} from '@data-exploration-components/types';

import { FileLinkedSearchResults } from '@data-exploration-components/containers/SearchResults/FileSearchResults/FileLinkedSearchResults';

export const LinkedResourceTable = ({
  isGroupingFilesEnabled,
  type,
  parentResource,
  onItemClicked,
  onParentAssetClick,
}: // ...selectionMode
{
  type: ResourceType;
  isGroupingFilesEnabled?: boolean;
  parentResource: ResourceItem;
  onItemClicked: (id: number) => void;
  onParentAssetClick: (assetId: number) => void;
} & SelectableItemsProps) => {
  const filter = { assetSubtreeIds: [{ value: parentResource.id }] };

  switch (type) {
    case 'asset':
      return (
        <AssetLinkedSearchResults
          defaultFilter={filter}
          onClick={(row) => onItemClicked(row.id)}
        />
      );
    case 'event':
      return (
        <EventLinkedSearchResults
          defaultFilter={filter}
          onClick={(el) => onItemClicked(el.id)}
          onParentAssetClick={onParentAssetClick}
        />
      );
    case 'file':
      return (
        <FileLinkedSearchResults
          defaultFilter={filter}
          isGroupingFilesEnabled={isGroupingFilesEnabled}
          onClick={(el) => onItemClicked(el.id)}
          onParentAssetClick={onParentAssetClick}
        />
      );
    case 'sequence':
      return (
        <SequenceLinkedSearchResults
          defaultFilter={filter}
          onClick={(el) => onItemClicked(el.id)}
          onParentAssetClick={onParentAssetClick}
        />
      );

    case 'timeSeries':
      return (
        <TimeseriesLinkedSearchResults
          defaultFilter={filter}
          onClick={(el) => onItemClicked(el.id)}
          onParentAssetClick={onParentAssetClick}
        />
      );
    default:
      return <>No relationships found</>;
  }
};

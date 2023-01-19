import React from 'react';

import {
  ResourceType,
  ResourceItem,
  SelectableItemsProps,
} from '@data-exploration-components/types';

import { AssetLinkedSearchResults } from '@data-exploration-components/containers/SearchResults/AssetSearchResults/AssetLinkedSearchResults';
import { TimeseriesLinkedSearchResults } from '@data-exploration-components/containers/SearchResults/TimeseriesSearchResults/TimeseriesLinkedSearchResults';
import { EventLinkedSearchResults } from '@data-exploration-components/containers/SearchResults/EventSearchResults/EventLinkedSearchResults';
import { FileLinkedSearchResults } from '@data-exploration-components/containers/SearchResults/FileSearchResults/FileLinkedSearchResults';
import { SequenceLinkedSearchResults } from '@data-exploration-components/containers/SearchResults/SequenceSearchResults/SequenceLinkedSearchResults';

export const LinkedResourceTable = ({
  isGroupingFilesEnabled,
  type,
  parentResource,
  onItemClicked,
  enableAdvancedFilter,
}: // ...selectionMode
{
  type: ResourceType;
  isGroupingFilesEnabled?: boolean;
  enableAdvancedFilter?: boolean;
  parentResource: ResourceItem;
  onItemClicked: (id: number) => void;
} & SelectableItemsProps) => {
  const filter = { assetSubtreeIds: [{ value: parentResource.id }] };

  switch (type) {
    case 'asset':
      return (
        <AssetLinkedSearchResults
          enableAdvancedFilter={enableAdvancedFilter}
          defaultFilter={filter}
          onClick={(row) => onItemClicked(row.id)}
        />
      );
    case 'event':
      return (
        <EventLinkedSearchResults
          enableAdvancedFilter={enableAdvancedFilter}
          defaultFilter={filter}
          onClick={(el) => onItemClicked(el.id)}
        />
      );
    case 'file':
      return (
        <FileLinkedSearchResults
          defaultFilter={filter}
          isGroupingFilesEnabled={isGroupingFilesEnabled}
          onClick={(el) => onItemClicked(el.id)}
        />
      );
    case 'sequence':
      return (
        <SequenceLinkedSearchResults
          enableAdvancedFilter={enableAdvancedFilter}
          defaultFilter={filter}
          onClick={(el) => onItemClicked(el.id)}
        />
      );

    case 'timeSeries':
      return (
        <TimeseriesLinkedSearchResults
          enableAdvancedFilter={enableAdvancedFilter}
          defaultFilter={filter}
          onClick={(el) => onItemClicked(el.id)}
        />
      );
    default:
      return <>No relationships found</>;
  }
};

import React from 'react';

import { ResourceType, ResourceItem, SelectableItemsProps } from 'types';

import { AssetLinkedSearchResults } from 'containers/SearchResults/AssetSearchResults/AssetLinkedSearchResults';
import { TimeseriesLinkedSearchResults } from 'containers/SearchResults/TimeseriesSearchResults/TimeseriesLinkedSearchResults';
import { EventLinkedSearchResults } from 'containers/SearchResults/EventSearchResults/EventLinkedSearchResults';
import { FileLinkedSearchResults } from 'containers/SearchResults/FileSearchResults/FileLinkedSearchResults';
import { SequenceLinkedSearchResults } from 'containers/SearchResults/SequenceSearchResults/SequenceLinkedSearchResults';

export const LinkedResourceTable = ({
  // isGroupingFilesEnabled,
  type,
  parentResource,
  onItemClicked,
  enableAdvancedFilter,
}: // ...selectionMode
{
  excludeParentResource?: boolean;
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
          onClick={row => onItemClicked(row.id)}
        />
      );
    case 'event':
      return (
        <EventLinkedSearchResults
          enableAdvancedFilter={enableAdvancedFilter}
          defaultFilter={filter}
          onClick={el => onItemClicked(el.id)}
        />
      );
    case 'file':
      return (
        <FileLinkedSearchResults
          defaultFilter={filter}
          onClick={el => onItemClicked(el.id)}
        />
      );
    // Keeping this for now, as some features are gonna be re-worked on in the near future.
    // return (
    //   <FileSearchResults
    //     isGroupingFilesEnabled={isGroupingFilesEnabled}
    //     relatedResourceType="linkedResource"
    //     parentResource={parentResource}
    //     filter={filter}
    //     onClick={el => onItemClicked(el.id)}
    //     {...selectionMode}
    //     hideColumnToggle
    //   />
    // );
    case 'sequence':
      return (
        <SequenceLinkedSearchResults
          enableAdvancedFilter={enableAdvancedFilter}
          defaultFilter={filter}
          onClick={el => onItemClicked(el.id)}
        />
      );

    case 'timeSeries':
      return (
        <TimeseriesLinkedSearchResults
          enableAdvancedFilter={enableAdvancedFilter}
          defaultFilter={filter}
          onClick={el => onItemClicked(el.id)}
        />
      );
    default:
      return <>No relationships found</>;
  }
};

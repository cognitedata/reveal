import React from 'react';
import { Asset } from '@cognite/sdk';
import { ResourceType, ResourceItem } from 'types';
import { AssetTable } from 'containers';
import {
  FileSearchResults,
  TimeseriesSearchResults,
  EventSearchResults,
  SequenceSearchResults,
} from 'containers/SearchResults';
import { SelectableItemsProps } from 'CommonProps';
import { ResultTableLoader } from 'containers/ResultTableLoader';

export const LinkedResourceTable = ({
  excludeParentResource = false,
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
  const filter = { assetSubtreeIds: [{ id: parentResource.id }] };

  switch (type) {
    case 'asset':
      return (
        <ResultTableLoader<Asset>
          excludedIds={excludeParentResource ? [parentResource.id] : []}
          mode="search"
          type="asset"
          filter={filter}
          {...selectionMode}
        >
          {props => (
            <AssetTable onRowClick={el => onItemClicked(el.id)} {...props} />
          )}
        </ResultTableLoader>
      );
    case 'event':
      return (
        <EventSearchResults
          filter={filter}
          onClick={el => onItemClicked(el.id)}
          {...selectionMode}
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
        />
      );
    case 'sequence':
      return (
        <SequenceSearchResults
          filter={filter}
          onClick={el => onItemClicked(el.id)}
          {...selectionMode}
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

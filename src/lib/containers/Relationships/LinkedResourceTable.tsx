import React from 'react';
import { Asset } from '@cognite/sdk';
import { ResourceType, ResourceItem } from 'lib/types';
import { AssetTable } from 'lib/containers';
import {
  FileSearchResults,
  TimeseriesSearchResults,
  EventSearchResults,
  SequenceSearchResults,
} from 'lib/containers/SearchResults';
import { SelectableItemsProps } from 'lib/CommonProps';
import { ResultTableLoader } from 'lib/containers/ResultTableLoader';

export const LinkedResourceTable = ({
  type,
  parentResource,
  onItemClicked,
  ...selectionMode
}: {
  type: ResourceType;
  parentResource: ResourceItem;
  onItemClicked: (id: number) => void;
} & SelectableItemsProps) => {
  const filter = { assetSubtreeIds: [{ id: parentResource.id }] };
  switch (type) {
    case 'asset':
      return (
        <ResultTableLoader<Asset>
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

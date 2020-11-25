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
import { useRelationshipCount } from 'lib/hooks/RelationshipHooks';

export type RelationshipTableProps = {
  type: ResourceType;
  parentResource: ResourceItem;
  onItemClicked: (id: number) => void;
};

export const RelationshipTable = ({
  type,
  parentResource,
  onItemClicked,
  ...selectionMode
}: RelationshipTableProps & SelectableItemsProps) => {
  const { data: count } = useRelationshipCount(parentResource, type);

  switch (type) {
    case 'asset':
      return (
        <ResultTableLoader<Asset>
          mode="relatedResources"
          type="asset"
          relatedResourceType="relationship"
          parentResource={parentResource}
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
          showRelatedResources
          relatedResourceType="relationship"
          parentResource={parentResource}
          count={count}
          onClick={el => onItemClicked(el.id)}
          {...selectionMode}
        />
      );
    case 'file':
      return (
        <FileSearchResults
          showRelatedResources
          relatedResourceType="relationship"
          parentResource={parentResource}
          onClick={el => onItemClicked(el.id)}
          count={count}
          {...selectionMode}
        />
      );
    case 'sequence':
      return (
        <SequenceSearchResults
          showRelatedResources
          relatedResourceType="relationship"
          parentResource={parentResource}
          onClick={el => onItemClicked(el.id)}
          count={count}
          {...selectionMode}
        />
      );

    case 'timeSeries':
      return (
        <TimeseriesSearchResults
          showRelatedResources
          relatedResourceType="relationship"
          parentResource={parentResource}
          count={count}
          onClick={el => onItemClicked(el.id)}
          initialView="grid"
          {...selectionMode}
        />
      );
    default:
      return <>No relationships found</>;
  }
};

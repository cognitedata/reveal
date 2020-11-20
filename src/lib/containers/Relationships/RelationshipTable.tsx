import React from 'react';
import {
  ExternalId,
  Timeseries,
  Sequence,
  Asset,
  CogniteEvent,
  FileInfo,
} from '@cognite/sdk';
import { ResourceType } from 'lib/types';
import { useRelatedResources } from 'lib/hooks/RelationshipHooks';
import { AssetTable } from 'lib/containers';
import {
  FileSearchResults,
  TimeseriesSearchResults,
  EventSearchResults,
  SequenceSearchResults,
} from 'lib/containers/SearchResults';
import { SelectableItemsProps } from 'lib/CommonProps';

export type Resource = Asset | CogniteEvent | FileInfo | Timeseries | Sequence;
export type RelationshipTableProps = {
  type: ResourceType;
  relationships?: (ExternalId & { type: ResourceType })[] | [];
  linkedResources?: Resource[];
  onItemClicked: (id: number) => void;
};

export const RelationshipTable = ({
  type,
  relationships = [],
  linkedResources = [],
  onItemClicked,
  ...selectionMode
}: RelationshipTableProps & SelectableItemsProps) => {
  const { data: relatedResources } = useRelatedResources(relationships);

  switch (type) {
    case 'asset':
      return (
        <AssetTable
          items={[...linkedResources, ...relatedResources.asset] as Asset[]}
          onRowClick={el => onItemClicked(el.id)}
          {...selectionMode}
        />
      );
    case 'event':
      return (
        <EventSearchResults
          items={
            [...linkedResources, ...relatedResources.event] as CogniteEvent[]
          }
          onClick={el => onItemClicked(el.id)}
          {...selectionMode}
        />
      );
    case 'file':
      return (
        <FileSearchResults
          items={[...linkedResources, ...relatedResources.file] as FileInfo[]}
          onClick={el => onItemClicked(el.id)}
          {...selectionMode}
        />
      );
    case 'sequence':
      return (
        <SequenceSearchResults
          items={
            [...linkedResources, ...relatedResources.sequence] as Sequence[]
          }
          onClick={el => onItemClicked(el.id)}
          {...selectionMode}
        />
      );

    case 'timeSeries':
      return (
        <TimeseriesSearchResults
          items={
            [...linkedResources, ...relatedResources.timeSeries] as Timeseries[]
          }
          onClick={el => onItemClicked(el.id)}
          initialView="grid"
          {...selectionMode}
        />
      );
    default:
      return <>No relationships found</>;
  }
};

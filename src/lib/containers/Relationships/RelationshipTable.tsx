import React from 'react';
import {
  ExternalId,
  Timeseries,
  Sequence,
  Asset,
  CogniteEvent,
  FileInfo,
} from '@cognite/sdk/dist/src/types';
import { ResourceType } from 'lib/types';
import { useRelatedResources } from 'lib/hooks/RelationshipHooks';
import {
  AssetTable,
  FileTable,
  TimeseriesTable,
  EventTable,
  SequenceTable,
} from 'lib/containers';

export type Resource = Asset | CogniteEvent | FileInfo | Timeseries | Sequence;
export type RelationshipTableProps = {
  type: ResourceType;
  relationships?: (ExternalId & { type: ResourceType })[] | [];
  linkedResources?: Resource[];
  onItemClicked: (item: Resource) => void;
};

export const RelationshipTable = ({
  type,
  relationships = [],
  linkedResources = [],
  onItemClicked,
}: RelationshipTableProps) => {
  const { data: relatedResources } = useRelatedResources(relationships);

  switch (type) {
    case 'asset':
      return (
        <AssetTable
          data={[...linkedResources, ...relatedResources.asset] as Asset[]}
          onItemClicked={onItemClicked}
        />
      );
    case 'event':
      return (
        <EventTable
          data={
            [...linkedResources, ...relatedResources.event] as CogniteEvent[]
          }
          onItemClicked={onItemClicked}
        />
      );
    case 'file':
      return (
        <FileTable
          data={[...linkedResources, ...relatedResources.file] as FileInfo[]}
          onItemClicked={onItemClicked}
        />
      );
    case 'sequence':
      return (
        <SequenceTable
          data={
            [...linkedResources, ...relatedResources.sequence] as Sequence[]
          }
          onItemClicked={onItemClicked}
        />
      );

    case 'timeSeries':
      return (
        <TimeseriesTable
          data={
            [...linkedResources, ...relatedResources.timeSeries] as Timeseries[]
          }
          onItemClicked={onItemClicked}
        />
      );
    default:
      return <>No relationships found</>;
  }
};

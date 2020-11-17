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
import { FileTable } from 'lib/containers';
import { List } from 'antd';
import { SearchResultListItem } from 'lib/containers/SearchResults/SearchResultList';
import { TimeseriesSparklineCard } from 'lib/containers/Timeseries';

export type Resource = Asset | CogniteEvent | FileInfo | Timeseries | Sequence;
export type RelationshipTableProps = {
  type: ResourceType;
  relationships?: (ExternalId & { type: ResourceType })[] | [];
  linkedResources?: Resource[];
  onItemClicked: (id: number) => void;
};

export const RelatedResourceList = <T extends Resource>({
  items,
  getTitle,
  getDescription,
  onRowClick,
}: {
  items: T[];
  getTitle: (i: T) => string;
  getDescription: (i: T) => string;
  onRowClick: (id: number) => void;
}) => {
  return (
    <List
      dataSource={items}
      renderItem={item => (
        <SearchResultListItem<T>
          item={item}
          getTitle={getTitle}
          getDescription={getDescription}
          onRowClick={onRowClick}
          style={{ cursor: 'pointer' }}
        />
      )}
    />
  );
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
        <RelatedResourceList<Asset>
          items={[...linkedResources, ...relatedResources.asset] as Asset[]}
          getTitle={i => i.name}
          getDescription={i => i.description || ''}
          onRowClick={onItemClicked}
        />
      );
    case 'event':
      return (
        <RelatedResourceList<CogniteEvent>
          items={
            [...linkedResources, ...relatedResources.event] as CogniteEvent[]
          }
          getTitle={i => `${i.type} - ${i.subtype}`}
          getDescription={i => i.description || ''}
          onRowClick={onItemClicked}
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
        <RelatedResourceList<Sequence>
          items={
            [...linkedResources, ...relatedResources.sequence] as Sequence[]
          }
          getTitle={i => i.name || `${i.id}`}
          getDescription={i => i.description || ''}
          onRowClick={onItemClicked}
        />
      );

    case 'timeSeries':
      return (
        <List
          grid={{ gutter: 16, column: 3 }}
          style={{ padding: '10px' }}
          dataSource={
            [...linkedResources, ...relatedResources.timeSeries] as Timeseries[]
          }
          renderItem={item => (
            <List.Item>
              <TimeseriesSparklineCard
                timeseries={item}
                onItemClicked={onItemClicked}
              />
            </List.Item>
          )}
        />
      );
    default:
      return <>No relationships found</>;
  }
};

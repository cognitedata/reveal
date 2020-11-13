import { Body } from '@cognite/cogs.js';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Asset, ExternalId } from '@cognite/sdk/dist/src';
import { RelationItem } from 'lib/containers/Relationships/RelationItem';
import { useRelatedResources } from 'lib/hooks/RelationshipHooks';
import { ResourceType, ResourceItem } from 'lib/types';
import React from 'react';
import styled from 'styled-components';

export const RelationshipList = ({
  assetId,
  relations,
  onClick,
}: {
  assetId?: number;
  relations: (ExternalId & { type: ResourceType })[];
  onClick: (item: ResourceItem) => void;
}) => {
  const {
    data: { asset, event, file, timeSeries, sequence },
  } = useRelatedResources(relations);

  const { data: linkedAsset } = useCdfItem<Asset>(
    'assets',
    { id: assetId || -1 },
    { enabled: !!assetId }
  );

  const hasNoRelations = () => {
    return (
      !linkedAsset &&
      asset.length === 0 &&
      event.length === 0 &&
      file.length === 0 &&
      timeSeries.length === 0 &&
      sequence.length === 0
    );
  };

  return (
    <RelationsContainer>
      <h2>Relations</h2>
      {linkedAsset && (
        <RelationItem
          type="asset"
          title={linkedAsset.name}
          onClick={() => onClick({ type: 'asset', id: linkedAsset.id })}
        />
      )}

      {asset.map(item => (
        <RelationItem
          type="asset"
          title={item.name}
          key={item.id}
          onClick={() => onClick({ type: 'asset', id: item.id })}
        />
      ))}

      {event.map(item => (
        <RelationItem
          type="event"
          title={item.id}
          key={item.id}
          onClick={() => onClick({ type: 'event', id: item.id })}
        />
      ))}

      {file.map(item => (
        <RelationItem
          type="file"
          title={item.name}
          key={item.id}
          onClick={() => onClick({ type: 'file', id: item.id })}
        />
      ))}

      {timeSeries.map(item => (
        <RelationItem
          type="timeSeries"
          title={item.name}
          key={item.id}
          onClick={() => onClick({ type: 'timeSeries', id: item.id })}
        />
      ))}

      {sequence.map(item => (
        <RelationItem
          type="sequence"
          title={item.name}
          key={item.id}
          onClick={() => onClick({ type: 'sequence', id: item.id })}
        />
      ))}

      {hasNoRelations() && (
        <Body level={1} style={{ marginBottom: '10px' }}>
          No relationships found
        </Body>
      )}
    </RelationsContainer>
  );
};

const RelationsContainer = styled.div`
  border: 1px solid #e8e8e8;
  padding: 10px;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 245px;
`;

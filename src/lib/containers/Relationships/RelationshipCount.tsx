import React from 'react';
import { ResourceType } from 'lib/types';
import { Icon, Detail } from '@cognite/cogs.js';
import styled from 'styled-components';

const getResourceIcon = (resourceType: ResourceType) => {
  switch (resourceType) {
    case 'asset':
      return <Icon type="DataStudio" />;
    case 'event':
      return <Icon type="Events" />;
    case 'timeSeries':
      return <Icon type="Timeseries" />;
    case 'sequence':
      return <Icon type="Duplicate" />;
    case 'file':
      return <Icon type="Document" />;
    default:
      return <></>;
  }
};

const RelationshipCountContainer = styled.div`
  width: 41px;
  height: 24px;
  background-color: #efefef;
  border-radius: 4px;
  margin-right: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const RelationshipCount = ({
  type,
  count = 0,
}: {
  type: ResourceType;
  count?: number;
}) => {
  return (
    <RelationshipCountContainer>
      {getResourceIcon(type)}
      <Detail strong style={{ marginLeft: '4px' }}>
        {count}
      </Detail>
    </RelationshipCountContainer>
  );
};

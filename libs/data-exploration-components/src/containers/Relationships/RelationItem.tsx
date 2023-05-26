import React from 'react';

import styled from 'styled-components';

import { ResourceIcons } from '@data-exploration-components/components/ResourceIcons/ResourceIcons';
import { ResourceType } from '@data-exploration-components/types';

import { Body, Overline } from '@cognite/cogs.js';

export const RelationItem = ({
  onClick,
  type,
  title,
}: {
  onClick?: () => void;
  type: ResourceType;
  title: string | number | undefined;
}) => (
  <RelationItemContainer onClick={onClick}>
    <ResourceIcons
      type={type}
      style={{ alignSelf: 'flex-start', marginRight: '10px' }}
    />
    <ResourceInfo>
      <Body level={1}>{title}</Body>
      <Overline level={2}>{type}</Overline>
    </ResourceInfo>
  </RelationItemContainer>
);

const RelationItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 15px;
  cursor: pointer;
`;

const ResourceInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: -5px;
`;

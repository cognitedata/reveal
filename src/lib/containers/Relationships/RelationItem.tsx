import { Body, Overline } from '@cognite/cogs.js';
import { ResourceType } from 'lib';
import { ResourceIcons } from 'lib/components/ResourceIcons/ResourceIcons';
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const RelationItem = ({
  onClick,
  type,
  title,
  path,
}: {
  onClick?: () => void;
  type: ResourceType;
  title: string | number | undefined;
  path: string;
}) => {
  return (
    <Link to={path}>
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
    </Link>
  );
};

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

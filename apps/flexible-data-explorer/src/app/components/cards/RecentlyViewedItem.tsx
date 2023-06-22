import React from 'react';

import styled from 'styled-components';

import { Body, Chip, Detail, Title } from '@cognite/cogs.js';

interface Props {
  type: string;
  name?: string;
  description?: string;
  externalId?: string;
  onClick?: () => void;
}

export const RecentlyViewedItem: React.FC<Props> = React.memo(
  ({ type, name, description, externalId, onClick }) => {
    return (
      <Container role="button" onClick={onClick}>
        <Content>
          <InfoContent>
            <Chip icon="History" type="neutral" size="small" />
            <InfoTextContent>
              <Detail muted>{type}</Detail>
              <Title level={6}>{name || externalId}</Title>
            </InfoTextContent>
          </InfoContent>
          <DescriptionContent>
            <StyledBody level={6} muted>
              {description || '-'}
            </StyledBody>
          </DescriptionContent>
        </Content>
      </Container>
    );
  }
);

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  /* border-radius: 8px; */
  background-color: #fff;
  /* margin-bottom: 4px; */
  cursor: pointer;

  &:hover {
    background: linear-gradient(
        0deg,
        rgba(59, 130, 246, 0.1),
        rgba(59, 130, 246, 0.1)
      ),
      rgba(255, 255, 255, 0.8);
  }
`;

const Content = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  padding: 16px;
  gap: 8px;
`;

const InfoContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const InfoTextContent = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 12px;
`;

const DescriptionContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledBody = styled(Body)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

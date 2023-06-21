import React from 'react';

import styled from 'styled-components';

import { Body, Chip, Detail, Title } from '@cognite/cogs.js';

interface Props {
  type: string;
  name?: string;
  description?: string;
  externalId?: string;
}

export const RecentlyViewedItem: React.FC<Props> = React.memo(
  ({ type, name, description, externalId }) => {
    return (
      <Container>
        <Content>
          <InfoContent>
            <Chip icon="History" type="neutral" size="small" />
            <InfoTextContent>
              <Title level={6}>{name || externalId}</Title>
              <Detail muted>{type}</Detail>
            </InfoTextContent>
          </InfoContent>
          <DescriptionContent>
            <StyledBody level={6} muted>
              {description || externalId}
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
  border-radius: 8px;
`;

const Content = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  padding: 10px 16px;
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

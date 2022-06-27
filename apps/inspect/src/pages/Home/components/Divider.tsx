import { Body } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export const Divider: React.FC<{ count?: number }> = ({ count }) => {
  return (
    <Container>
      <Line />
      <div>
        <Body level={3}>
          {count || 0} key{count === 1 ? '' : 's'}
        </Body>
      </div>
      <Line />
    </Container>
  );
};

const Line = styled.div`
  border-bottom: 1px solid lightgray;
  flex: 1;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  margin-bottom: 16px;
`;

import { Body } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export const Header = (props: { fetchedCount: number; totalCount: number }) => {
  const { fetchedCount, totalCount } = props;
  return (
    <Container>
      <Body level={2}>
        Showing ({fetchedCount} / {totalCount})
      </Body>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: flex-start;
  padding: 10px 16px;
  align-items: center;
`;

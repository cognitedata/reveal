import { Body } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export const Header = (props: { fetchedCount: number; totalCount: number }) => {
  const { fetchedCount, totalCount } = props;
  return (
    <Container>
      <div>
        <Body level={2}>
          Showing ({fetchedCount} / {totalCount})
        </Body>
      </div>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: Left;
  margin: 0px 16px 16px 16px;
`;

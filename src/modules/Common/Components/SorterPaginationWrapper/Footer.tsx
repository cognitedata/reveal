import { Body } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export const Footer = (props: { fetchedCount: number; totalCount: number }) => {
  const { fetchedCount, totalCount } = props;
  return (
    <Container>
      <div>
        <Body level={2}>
          Showing ({fetchedCount} / {totalCount}) items. Use filters to refine
          your search.
        </Body>
      </div>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  margin: 16px 0px;
`;

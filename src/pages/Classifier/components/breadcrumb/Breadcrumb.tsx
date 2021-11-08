import { Body } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 3rem;
  background-color: var(--cogs-greyscale-grey1);
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
  display: flex;
  align-items: center;
  padding: 0 2.5rem;

  & > * {
    margin-right: 0.5rem;
  }
`;

export const Breadcrumb: React.FC = () => {
  return (
    <Container>
      <Body level={2} strong>
        Document Classifiers - Version: 1.0
      </Body>
    </Container>
  );
};

import React from 'react';
import { getSDK } from 'utils/SDK';
import styled from 'styled-components';
import configureStoreProd from '../store/storeProd';
import { DataExplorationProvider } from '../context';

export const store = configureStoreProd();

const sdk = getSDK();

export const Container = styled.div`
  width: 100%;
  height: 600px;
  display: flex;
`;

export const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container>
      <DataExplorationProvider sdk={sdk} store={store}>
        {children}
      </DataExplorationProvider>
    </Container>
  );
};

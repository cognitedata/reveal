import React from 'react';
import styled from 'styled-components';
import { asset, file } from './stub';
import { DataExplorationProvider } from '../lib/context/DataExplorationContext';

export const Container = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
`;

export const sdk = {
  post: async (query: string) => {
    if (query.includes('aggregate')) {
      return { data: { items: [{ count: 1 }] } };
    }
    if (query.includes('assets')) {
      return { data: { items: [asset] } };
    }
    if (query.includes('files')) {
      return { data: { items: [file] } };
    }
    return { data: { items: [] } };
  },
  datasets: {
    list: async () => ({ data: { items: [] } }),
  },
  groups: {
    list: async () => ({ items: [] }),
  },
  files: {
    getDownloadUrls: async () => [{ downloadUrl: '//unsplash.it/300/300' }],
  },
};

export const Wrapper = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => {
  return (
    <Container style={style}>
      {/** @ts-ignores */}
      <DataExplorationProvider sdk={sdk}>{children}</DataExplorationProvider>
    </Container>
  );
};

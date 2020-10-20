import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { text } from '@storybook/addon-knobs';
import { files } from 'stubs/files';
import { FileSearchResults } from './FileSearchResults';

export default {
  title: 'Search Results/FileSearchResults',
  component: FileSearchResults,
  decorators: [
    (storyFn: any) => (
      <Container>
        <DataExplorationProvider sdk={sdkMock}>
          {storyFn()}
        </DataExplorationProvider>
      </Container>
    ),
  ],
};

const sdkMock = {
  post: async (query: string, body: any) => {
    if (query.includes('aggregate')) {
      return { data: { items: [{ count: 1 }] } };
    }
    if (query.includes('files/byids')) {
      return {
        data: { items: files.filter(el => body.data.items[0].id === el.id) },
      };
    }
    if (query.includes('files')) {
      return { data: { items: files } };
    }
    return { data: { items: [] } };
  },
  files: {
    getDownloadUrls: async () => [{ downloadUrl: '//unsplash.it/300/300' }],
  },
};
export const Example = () => <FileSearchResults query={text('query', '')} />;

const Container = styled.div`
  padding: 20px;
  height: 400px;
  display: flex;
`;

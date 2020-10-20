import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { boolean } from '@storybook/addon-knobs';
import { files } from 'stubs/files';
import { FilePreview } from './FilePreview';

export default {
  title: 'Files/FilePreview',
  component: FilePreview,
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
  post: async (query: string) => {
    if (query.includes('aggregate')) {
      return { data: { items: [{ count: 1 }] } };
    }
    if (query.includes('files')) {
      return { data: { items: [files[0]] } };
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
export const Example = () => (
  <FilePreview
    fileId={1}
    contextualization={boolean('contextualization', false)}
  />
);

const Container = styled.div`
  padding: 20px;
  display: flex;
`;

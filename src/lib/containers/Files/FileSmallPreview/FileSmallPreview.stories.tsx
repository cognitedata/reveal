import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { files } from 'stubs/files';
import { FileSmallPreview } from './FileSmallPreview';

export default {
  title: 'Files/FileSmallPreview',
  component: FileSmallPreview,
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
  files: {
    getDownloadUrls: async () => [{ downloadUrl: '//unsplash.it/300/300' }],
  },
};
export const Example = () => <FileSmallPreview fileId={files[0].id} />;

const Container = styled.div`
  padding: 20px;
  min-height: 400px;
  width: 300px;
  display: flex;
`;

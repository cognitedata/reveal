import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { files } from 'stubs/files';
import { DirectoryPrefixFilter } from './DirectoryPrefixFilter';

export default {
  title: 'Search Results/Filters/Files/DirectoryPrefixFilter',
  component: DirectoryPrefixFilter,
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
  post: async () => ({ data: { items: files } }),
};
export const Example = () => <DirectoryPrefixFilter />;

const Container = styled.div`
  padding: 20px;
  min-height: 400px;
  display: flex;
`;

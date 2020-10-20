import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { files } from 'stubs/files';
import { UploadedFilter } from './UploadedFilter';

export default {
  title: 'Search Results/Filters/Files/UploadedFilter',
  component: UploadedFilter,
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
export const Example = () => <UploadedFilter />;

const Container = styled.div`
  padding: 20px;
  min-height: 400px;
  display: flex;
`;

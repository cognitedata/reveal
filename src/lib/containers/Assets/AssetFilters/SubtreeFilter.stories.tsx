import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { assets } from 'stubs/assets';
import { SubtreeFilter } from './SubtreeFilter';

export default {
  title: 'Search Results/Filters/Assets/SubtreeFilter',
  component: SubtreeFilter,
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
  post: async () => ({ data: { items: assets } }),
};
export const Example = () => <SubtreeFilter />;

const Container = styled.div`
  padding: 20px;
  min-height: 400px;
  display: flex;
`;

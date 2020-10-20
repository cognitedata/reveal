import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { sequences } from 'stubs/sequences';
import { SequenceSmallPreview } from './SequenceSmallPreview';

export default {
  title: 'Sequences/SequenceSmallPreview',
  component: SequenceSmallPreview,
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
  post: async () => ({ data: { items: sequences } }),
};
export const Example = () => (
  <SequenceSmallPreview sequenceId={sequences[0].id} />
);

const Container = styled.div`
  padding: 20px;
  min-height: 400px;
  width: 300px;
  display: flex;
`;

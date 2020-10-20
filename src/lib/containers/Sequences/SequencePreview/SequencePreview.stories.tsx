import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { sequences } from 'stubs/sequences';
import { SequencePreview } from './SequencePreview';

export default {
  title: 'Sequences/SequencePreview',
  component: SequencePreview,
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
export const Example = () => <SequencePreview sequenceId={sequences[0].id} />;

const Container = styled.div`
  padding: 20px;
  min-height: 400px;
  display: flex;
`;

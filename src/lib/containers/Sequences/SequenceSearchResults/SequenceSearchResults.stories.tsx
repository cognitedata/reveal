import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { text } from '@storybook/addon-knobs';
import { sequences } from 'stubs/sequences';
import { SequenceSearchResults } from './SequenceSearchResults';

export default {
  title: 'Search Results/SequenceSearchResults',
  component: SequenceSearchResults,
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
    if (query.includes('sequences/byids')) {
      return {
        data: {
          items: sequences.filter(el => body.data.items[0].id === el.id),
        },
      };
    }
    if (query.includes('sequences')) {
      return { data: { items: sequences } };
    }
    return { data: { items: [] } };
  },
};
export const Example = () => (
  <SequenceSearchResults query={text('query', '')} />
);

const Container = styled.div`
  padding: 20px;
  height: 400px;
  display: flex;
`;

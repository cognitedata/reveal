import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { text } from '@storybook/addon-knobs';
import { events } from 'stubs/events';
import { EventSearchResults } from './EventSearchResults';

export default {
  title: 'Search Results/EventSearchResults',
  component: EventSearchResults,
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
    if (query.includes('events/byids')) {
      return {
        data: { items: events.filter(el => body.data.items[0].id === el.id) },
      };
    }
    if (query.includes('events')) {
      return { data: { items: events } };
    }
    return { data: { items: [] } };
  },
};
export const Example = () => <EventSearchResults query={text('query', '')} />;

const Container = styled.div`
  padding: 20px;
  height: 400px;
  display: flex;
`;

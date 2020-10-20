import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { events } from 'stubs/events';
import { EventSubTypeFilter } from './EventSubTypeFilter';

export default {
  title: 'Search Results/Filters/Events/EventSubTypeFilter',
  component: EventSubTypeFilter,
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
  post: async () => ({ data: { items: events } }),
};
export const Example = () => <EventSubTypeFilter items={events} />;

const Container = styled.div`
  padding: 20px;
  min-height: 400px;
  display: flex;
`;

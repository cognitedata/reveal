import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { events } from 'stubs/events';
import { EventTypeFilter } from './EventTypeFilter';

export default {
  title: 'Search Results/Filters/Events/EventTypeFilter',
  component: EventTypeFilter,
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
export const Example = () => <EventTypeFilter items={events} />;

const Container = styled.div`
  padding: 20px;
  min-height: 400px;
  display: flex;
`;

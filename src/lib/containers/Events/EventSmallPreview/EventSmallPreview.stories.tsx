import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { events } from 'stubs/events';
import { EventSmallPreview } from './EventSmallPreview';

export default {
  title: 'Events/EventSmallPreview',
  component: EventSmallPreview,
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
export const Example = () => <EventSmallPreview eventId={events[0].id} />;

const Container = styled.div`
  padding: 20px;
  min-height: 400px;
  width: 300px;
  display: flex;
`;

import React from 'react';
import styled from 'styled-components';
import { DataExplorationProvider } from 'lib/context';
import { events } from 'stubs/events';
import { EventPreview } from './EventPreview';

export default {
  title: 'Events/EventPreview',
  component: EventPreview,
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
export const Example = () => <EventPreview eventId={events[0].id} />;

const Container = styled.div`
  padding: 20px;
  min-height: 400px;
  display: flex;
`;

import React from 'react';
import { events } from 'stubs/events';
import { EventPreview } from './EventPreview';

export default {
  title: 'Events/EventPreview',
  component: EventPreview,
};
export const Example = () => <EventPreview eventId={events[0].id} />;

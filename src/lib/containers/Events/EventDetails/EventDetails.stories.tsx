import React from 'react';
import { events } from 'lib/stubs/events';
import { EventDetails } from './EventDetails';

export default {
  title: 'Events/EventDetails',
  component: EventDetails,
};
export const Example = () => <EventDetails event={events[0]} />;

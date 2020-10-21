import React from 'react';
import { events } from 'stubs/events';
import { EventTypeFilter } from './EventTypeFilter';

export default {
  title: 'Search Results/Filters/Events/EventTypeFilter',
  component: EventTypeFilter,
};
export const Example = () => <EventTypeFilter items={events} />;

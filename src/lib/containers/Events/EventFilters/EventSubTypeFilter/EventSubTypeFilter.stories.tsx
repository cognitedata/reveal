import React from 'react';
import { events } from 'stubs/events';
import { EventSubTypeFilter } from './EventSubTypeFilter';

export default {
  title: 'Search Results/Filters/Events/EventSubTypeFilter',
  component: EventSubTypeFilter,
};
export const Example = () => <EventSubTypeFilter items={events} />;

import React from 'react';

import { events } from '@data-exploration-lib/core';

import { EventInfo } from './EventInfo';

export default {
  title: 'Events/EventInfo',
  component: EventInfo,
};
export const Example = () => <EventInfo event={events[0]} />;

import { events } from '@data-exploration-lib/core';
import React from 'react';

import { EventInfo } from './EventInfo';

export default {
  title: 'Events/EventInfo',
  component: EventInfo,
};
export const Example = () => <EventInfo event={events[0]} />;

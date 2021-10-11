import React from 'react';

import { Loader } from '@cognite/cogs.js';

const EventsNds = React.lazy(
  () => import(/* webpackChunkName: 'events_nds' */ './EventsNDS')
);

export default () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <EventsNds />
  </React.Suspense>
);

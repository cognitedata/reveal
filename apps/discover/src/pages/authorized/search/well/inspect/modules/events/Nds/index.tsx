import React from 'react';

import { Loader } from '@cognite/cogs.js';

const EventsNdsLazy = React.lazy(
  () => import(/* webpackChunkName: 'events_nds' */ './EventsNDS')
);

const EventsNds = () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <EventsNdsLazy />
  </React.Suspense>
);

export default EventsNds;

import * as React from 'react';

import { Loader } from '@cognite/cogs.js';

const NdsEventsLazy = React.lazy(
  () => import(/* webpackChunkName: 'nds_events' */ './NdsEvents')
);

const EventsNds = () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <NdsEventsLazy />
  </React.Suspense>
);

export default EventsNds;

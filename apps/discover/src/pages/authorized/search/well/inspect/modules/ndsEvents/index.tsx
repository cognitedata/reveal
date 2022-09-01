import * as React from 'react';

const NdsEventsLazy = React.lazy(
  () => import(/* webpackChunkName: 'nds_events' */ './NdsEvents')
);

const EventsNds = () => (
  <React.Suspense fallback={null}>
    <NdsEventsLazy />
  </React.Suspense>
);

export default EventsNds;

import * as React from 'react';

const NptEventsLazy = React.lazy(
  () => import(/* webpackChunkName: 'events_npt' */ './NptEvents')
);

const NptEvents = () => (
  <React.Suspense fallback={null}>
    <NptEventsLazy />
  </React.Suspense>
);

export default NptEvents;

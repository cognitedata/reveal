import React from 'react';

import { Loader } from '@cognite/cogs.js';

const NptEventsLazy = React.lazy(
  () => import(/* webpackChunkName: 'events_npt' */ './NptEvents')
);

const NptEvents = () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <NptEventsLazy />
  </React.Suspense>
);

export default NptEvents;

import React from 'react';

import { Loader } from '@cognite/cogs.js';

const NPTEventsLazy = React.lazy(
  () => import(/* webpackChunkName: 'events_npt' */ './NPTEvents')
);

const NPTEvents = () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <NPTEventsLazy />
  </React.Suspense>
);

export default NPTEvents;

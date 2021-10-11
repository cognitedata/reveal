import React from 'react';

import { Loader } from '@cognite/cogs.js';

const NPTEvents = React.lazy(
  () => import(/* webpackChunkName: 'events_npt' */ './NPTEvents')
);

export default () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <NPTEvents />
  </React.Suspense>
);

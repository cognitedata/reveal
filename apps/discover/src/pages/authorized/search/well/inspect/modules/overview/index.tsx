import React from 'react';

import { Loader } from '@cognite/cogs.js';

const Overview = React.lazy(() => import('./Overview'));

export default () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <Overview />
  </React.Suspense>
);

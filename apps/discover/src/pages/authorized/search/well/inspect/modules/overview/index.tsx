import * as React from 'react';

import { Loader } from '@cognite/cogs.js';

const OverviewLazy = React.lazy(() => import('./Overview'));

const Overview = () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <OverviewLazy />
  </React.Suspense>
);

export default Overview;

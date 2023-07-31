import * as React from 'react';

const OverviewLazy = React.lazy(() => import('./Overview'));

const Overview = () => (
  <React.Suspense fallback={null}>
    <OverviewLazy />
  </React.Suspense>
);

export default Overview;

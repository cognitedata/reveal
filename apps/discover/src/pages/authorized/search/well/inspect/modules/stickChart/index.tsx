import * as React from 'react';

import { Loader } from '@cognite/cogs.js';

const StickChartLazy = React.lazy(() => import('./StickChart'));

const StickChart = () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <StickChartLazy />
  </React.Suspense>
);

export default StickChart;

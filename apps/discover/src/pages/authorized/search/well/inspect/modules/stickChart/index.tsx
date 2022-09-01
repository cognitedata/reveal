import * as React from 'react';

const StickChartLazy = React.lazy(() => import('./StickChart'));

const StickChart = () => (
  <React.Suspense fallback={null}>
    <StickChartLazy />
  </React.Suspense>
);

export default StickChart;

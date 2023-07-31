import * as React from 'react';

const WellLogsLazy = React.lazy(() => import('./WellLogs'));

const WellLogs = () => (
  <React.Suspense fallback={null}>
    <WellLogsLazy />
  </React.Suspense>
);

export default WellLogs;

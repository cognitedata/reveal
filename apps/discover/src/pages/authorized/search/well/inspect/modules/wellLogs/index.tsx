import * as React from 'react';

import { Loader } from '@cognite/cogs.js';

const WellLogsLazy = React.lazy(() => import('./WellLogs'));

const WellLogs = () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <WellLogsLazy />
  </React.Suspense>
);

export default WellLogs;

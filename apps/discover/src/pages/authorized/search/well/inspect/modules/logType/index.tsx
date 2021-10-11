import React from 'react';

import { Loader } from '@cognite/cogs.js';

const LogType = React.lazy(() => import('./LogType'));

export default () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <LogType />
  </React.Suspense>
);

import React from 'react';

import { Loader } from '@cognite/cogs.js';

const LogTypeLazy = React.lazy(() => import('./LogType'));

const LogType = () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <LogTypeLazy />
  </React.Suspense>
);

export default LogType;

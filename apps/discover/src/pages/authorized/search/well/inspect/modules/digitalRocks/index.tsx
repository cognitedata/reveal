import React from 'react';

import { Loader } from '@cognite/cogs.js';

const DigitalRocks = React.lazy(() => import('./DigitalRocks'));

export default () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <DigitalRocks />
  </React.Suspense>
);

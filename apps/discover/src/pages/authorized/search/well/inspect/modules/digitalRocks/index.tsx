import * as React from 'react';

import { Loader } from '@cognite/cogs.js';

const DigitalRocksLazy = React.lazy(() => import('./DigitalRocks'));

const DigitalRocks = () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <DigitalRocksLazy />
  </React.Suspense>
);

export default DigitalRocks;

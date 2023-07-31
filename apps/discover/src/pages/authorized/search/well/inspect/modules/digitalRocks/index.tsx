import * as React from 'react';

const DigitalRocksLazy = React.lazy(() => import('./DigitalRocks'));

const DigitalRocks = () => (
  <React.Suspense fallback={null}>
    <DigitalRocksLazy />
  </React.Suspense>
);

export default DigitalRocks;

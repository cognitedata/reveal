import * as React from 'react';

const CasingsLazy = React.lazy(() => import('./Casings'));

const Casing = () => (
  <React.Suspense fallback={null}>
    <CasingsLazy />
  </React.Suspense>
);

export default Casing;

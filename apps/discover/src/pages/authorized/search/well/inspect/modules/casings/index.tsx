import * as React from 'react';

import { Loader } from '@cognite/cogs.js';

const CasingsLazy = React.lazy(() => import('./Casings'));

const Casing = () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <CasingsLazy />
  </React.Suspense>
);

export default Casing;

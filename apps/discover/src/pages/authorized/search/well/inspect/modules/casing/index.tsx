import React from 'react';

import { Loader } from '@cognite/cogs.js';

const CasingLazy = React.lazy(() => import('./Casing'));

const Casing = () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <CasingLazy />
  </React.Suspense>
);

export default Casing;

import React from 'react';

import { Loader } from '@cognite/cogs.js';

const Casing = React.lazy(() => import('./Casing'));

export default () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <Casing />
  </React.Suspense>
);

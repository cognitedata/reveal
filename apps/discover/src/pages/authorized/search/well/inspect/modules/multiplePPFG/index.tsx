import React from 'react';

import { Loader } from '@cognite/cogs.js';

const MultiplePPFG = React.lazy(() => import('./MultiplePPFGPreview'));

export default () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <MultiplePPFG />
  </React.Suspense>
);

import React from 'react';

import { Loader } from '@cognite/cogs.js';

const MultiplePPFGLazy = React.lazy(() => import('./MultiplePPFGPreview'));

const MultiplePPFG = () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <MultiplePPFGLazy />
  </React.Suspense>
);

export default MultiplePPFG;

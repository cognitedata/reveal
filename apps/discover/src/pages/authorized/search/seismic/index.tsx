import React from 'react';

import { Loader } from '@cognite/cogs.js';

const SeismicComponent = React.lazy(
  () => import(/* webpackChunkName: "seismic" */ './DataSearch')
);

export default () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <SeismicComponent />
  </React.Suspense>
);

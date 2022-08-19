import * as React from 'react';

import { Loader } from '@cognite/cogs.js';

const SeismicComponentLazy = React.lazy(
  () => import(/* webpackChunkName: "seismic" */ './DataSearch')
);

const SeismicComponent = () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <SeismicComponentLazy />
  </React.Suspense>
);

export default SeismicComponent;

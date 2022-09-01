import * as React from 'react';

const SeismicComponentLazy = React.lazy(
  () => import(/* webpackChunkName: "seismic" */ './DataSearch')
);

const SeismicComponent = () => (
  <React.Suspense fallback={null}>
    <SeismicComponentLazy />
  </React.Suspense>
);

export default SeismicComponent;

import * as React from 'react';

const WellsLazy = React.lazy(
  () => import(/* webpackChunkName: "wells" */ './wellSearch')
);

const Wells = () => (
  <React.Suspense fallback={null}>
    <WellsLazy />
  </React.Suspense>
);

export default Wells;

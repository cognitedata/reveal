import * as React from 'react';

const WellInspectLazy = React.lazy(
  () => import(/* webpackChunkName: 'well-inspect' */ './Inspect')
);

const WellInspect = () => (
  <React.Suspense fallback={null}>
    <WellInspectLazy />
  </React.Suspense>
);

export default WellInspect;

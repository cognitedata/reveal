import React from 'react';

import { Loader } from '@cognite/cogs.js';

const WellInspect = React.lazy(
  () => import(/* webpackChunkName: 'well-inspect' */ './Inspect')
);

export default () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <WellInspect />
  </React.Suspense>
);

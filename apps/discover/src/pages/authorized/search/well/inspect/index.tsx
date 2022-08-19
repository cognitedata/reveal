import * as React from 'react';

import { Loader } from '@cognite/cogs.js';

const WellInspectLazy = React.lazy(
  () => import(/* webpackChunkName: 'well-inspect' */ './Inspect')
);

const WellInspect = () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <WellInspectLazy />
  </React.Suspense>
);

export default WellInspect;

import * as React from 'react';

import { Loader } from '@cognite/cogs.js';

const WellsLazy = React.lazy(
  () => import(/* webpackChunkName: "wells" */ './wellSearch')
);

const Wells = () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <WellsLazy />
  </React.Suspense>
);

export default Wells;

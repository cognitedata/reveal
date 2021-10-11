import React from 'react';

import { Loader } from '@cognite/cogs.js';

const Wells = React.lazy(
  () => import(/* webpackChunkName: "wells" */ './wellSearch')
);

export default () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <Wells />
  </React.Suspense>
);

import React from 'react';

import { Loader } from '@cognite/cogs.js';

const Trajectory = React.lazy(
  () => import(/* webpackChunkName: 'trajectory' */ './Trajectory')
);

export default () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <Trajectory />
  </React.Suspense>
);

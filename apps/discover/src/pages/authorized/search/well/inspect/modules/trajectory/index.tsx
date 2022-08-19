import * as React from 'react';

import { Loader } from '@cognite/cogs.js';

const TrajectoryLazy = React.lazy(
  () => import(/* webpackChunkName: 'trajectory' */ './Trajectory')
);

const Trajectory = () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <TrajectoryLazy />
  </React.Suspense>
);

export default Trajectory;

import * as React from 'react';

const TrajectoryLazy = React.lazy(
  () => import(/* webpackChunkName: 'trajectory' */ './Trajectory')
);

const Trajectory = () => (
  <React.Suspense fallback={null}>
    <TrajectoryLazy />
  </React.Suspense>
);

export default Trajectory;

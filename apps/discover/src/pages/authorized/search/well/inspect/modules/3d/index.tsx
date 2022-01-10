import React from 'react';

import { Loading } from 'components/loading';

const ThreeDeeLazy = React.lazy(() => import('./threeDee'));

const ThreeDee = () => (
  <React.Suspense fallback={<Loading />}>
    <ThreeDeeLazy />
  </React.Suspense>
);

export default ThreeDee;

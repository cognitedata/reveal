import React from 'react';

import { WhiteLoader } from 'components/loading';

const ThreeDeeLazy = React.lazy(() => import('./threeDee'));

const ThreeDee = () => (
  <React.Suspense fallback={<WhiteLoader />}>
    <ThreeDeeLazy />
  </React.Suspense>
);

export default ThreeDee;

import React from 'react';

import { WhiteLoader } from 'components/loading';

const ThreeDee = React.lazy(() => import('./threeDee'));

export default () => (
  <React.Suspense fallback={<WhiteLoader />}>
    <ThreeDee />
  </React.Suspense>
);

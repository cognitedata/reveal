import React from 'react';

import { WhiteLoader } from 'components/loading';

const Measurements = React.lazy(() => import('./Measurements'));

export default () => (
  <React.Suspense fallback={<WhiteLoader />}>
    <Measurements />
  </React.Suspense>
);

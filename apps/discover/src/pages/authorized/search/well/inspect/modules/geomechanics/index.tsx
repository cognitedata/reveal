import React from 'react';

import { WhiteLoader } from 'components/loading';

const Geomechanics = React.lazy(() => import('./Geomechanics'));

export default () => (
  <React.Suspense fallback={<WhiteLoader />}>
    <Geomechanics />
  </React.Suspense>
);

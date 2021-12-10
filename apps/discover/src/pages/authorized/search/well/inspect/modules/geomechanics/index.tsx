import React from 'react';

import { WhiteLoader } from 'components/loading';

const GeomechanicsLazy = React.lazy(() => import('./Geomechanics'));

const Geomechanics = () => (
  <React.Suspense fallback={<WhiteLoader />}>
    <GeomechanicsLazy />
  </React.Suspense>
);

export default Geomechanics;

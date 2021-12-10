import React from 'react';

import { WhiteLoader } from 'components/loading';

const MeasurementsLazy = React.lazy(() => import('./Measurements'));

const Measurements = () => (
  <React.Suspense fallback={<WhiteLoader />}>
    <MeasurementsLazy />
  </React.Suspense>
);

export default Measurements;

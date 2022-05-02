import React from 'react';

import { Loading } from 'components/Loading';

const MeasurementsLazy = React.lazy(() => import('./Measurements'));

const Measurements = () => (
  <React.Suspense fallback={<Loading loadingTitle="Loading" />}>
    <MeasurementsLazy />
  </React.Suspense>
);

export default Measurements;

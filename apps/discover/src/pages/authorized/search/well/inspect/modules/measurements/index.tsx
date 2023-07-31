import * as React from 'react';

const MeasurementsLazy = React.lazy(() => import('./Measurements'));

const Measurements = () => (
  <React.Suspense fallback={null}>
    <MeasurementsLazy />
  </React.Suspense>
);

export default Measurements;

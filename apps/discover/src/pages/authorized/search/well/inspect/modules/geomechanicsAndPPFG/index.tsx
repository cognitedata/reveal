import * as React from 'react';

const GeomechanicsAndPPFGLazy = React.lazy(
  () => import('./GeomechanicsAndPPFG')
);

const GeomechanicsAndPPFG = () => (
  <React.Suspense fallback={null}>
    <GeomechanicsAndPPFGLazy />
  </React.Suspense>
);

export default GeomechanicsAndPPFG;

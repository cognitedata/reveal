import React from 'react';

import { Loading } from 'components/Loading';

const GeomechanicsAndPPFGLazy = React.lazy(
  () => import('./GeomechanicsAndPPFG')
);

const GeomechanicsAndPPFG = () => (
  <React.Suspense fallback={<Loading loadingTitle="Loading" />}>
    <GeomechanicsAndPPFGLazy />
  </React.Suspense>
);

export default GeomechanicsAndPPFG;

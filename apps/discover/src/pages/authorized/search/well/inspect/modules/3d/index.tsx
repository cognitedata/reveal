import * as React from 'react';

import { Loading } from 'components/Loading';

const ThreeDeeLazy = React.lazy(() => import('./ThreeDeePreview'));

const ThreeDee = () => (
  <React.Suspense fallback={<Loading />}>
    <ThreeDeeLazy />
  </React.Suspense>
);

export default ThreeDee;

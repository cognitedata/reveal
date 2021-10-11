import React from 'react';

import { WhiteLoader } from 'components/loading/WhiteLoader';

const RelatedDocument = React.lazy(() => import('./RelatedDocument'));

export default () => (
  <React.Suspense fallback={<WhiteLoader />}>
    <RelatedDocument />
  </React.Suspense>
);

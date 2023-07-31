import * as React from 'react';

import { LoadingOverlay } from 'components/Loading';

const ContentLazy = React.lazy(
  () => import(/* webpackChunkName: 'well-content' */ './Content')
);

const Content = () => (
  <React.Suspense fallback={<LoadingOverlay />}>
    <ContentLazy />
  </React.Suspense>
);

export default Content;

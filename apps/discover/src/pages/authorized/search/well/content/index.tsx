import React from 'react';

import { Loader } from '@cognite/cogs.js';

const Content = React.lazy(
  () => import(/* webpackChunkName: 'well-content' */ './Content')
);

export default () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <Content />
  </React.Suspense>
);

import * as React from 'react';

import { Loader } from '@cognite/cogs.js';

const ContentLazy = React.lazy(
  () => import(/* webpackChunkName: 'well-content' */ './Content')
);

const Content = () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <ContentLazy />
  </React.Suspense>
);

export default Content;

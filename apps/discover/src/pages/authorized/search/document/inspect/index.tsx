import React from 'react';

import { Loader } from '@cognite/cogs.js';

const DocInspect = React.lazy(
  () => import(/* webpackChunkName: 'doc-inspect' */ './Inspect')
);

export default () => (
  <React.Suspense fallback={<Loader darkMode={false} />}>
    <DocInspect />
  </React.Suspense>
);

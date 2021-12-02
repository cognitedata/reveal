import React from 'react';

import { Empty } from '../elements';

const DocumentSearch = React.lazy(
  () => import(/* webpackChunkName: "documents" */ './DocumentSearch')
);

export default () => (
  <React.Suspense fallback={<Empty />}>
    <DocumentSearch />
  </React.Suspense>
);

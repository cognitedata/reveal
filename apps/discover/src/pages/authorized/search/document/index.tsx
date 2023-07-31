import * as React from 'react';

import { Empty } from '../elements';

const DocumentSearchLazy = React.lazy(
  () => import(/* webpackChunkName: "documents" */ './DocumentSearch')
);

const DocumentSearch = () => (
  <React.Suspense fallback={<Empty />}>
    <DocumentSearchLazy />
  </React.Suspense>
);

export default DocumentSearch;

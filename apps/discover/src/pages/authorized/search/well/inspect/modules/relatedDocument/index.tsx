import React from 'react';

import { Loading } from 'components/loading';

const RelatedDocumentLazy = React.lazy(() => import('./RelatedDocument'));

const RelatedDocument = () => (
  <React.Suspense fallback={<Loading loadingTitle="Loading" />}>
    <RelatedDocumentLazy />
  </React.Suspense>
);

export default RelatedDocument;

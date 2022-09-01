import * as React from 'react';

const RelatedDocumentLazy = React.lazy(() => import('./RelatedDocument'));

const RelatedDocument = () => (
  <React.Suspense fallback={null}>
    <RelatedDocumentLazy />
  </React.Suspense>
);

export default RelatedDocument;

import React from 'react';

import { WhiteLoader } from 'components/loading/WhiteLoader';

const RelatedDocumentLazy = React.lazy(() => import('./RelatedDocument'));

const RelatedDocument = () => (
  <React.Suspense fallback={<WhiteLoader />}>
    <RelatedDocumentLazy />
  </React.Suspense>
);

export default RelatedDocument;

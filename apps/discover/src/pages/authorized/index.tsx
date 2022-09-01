import * as React from 'react';

import { LoadingOverlay } from 'components/Loading';

const Content = React.lazy(
  () => import(/* webpackChunkName: 'main-content' */ './Content')
);

const AuthorizedApp = () => {
  return (
    <React.Suspense fallback={<LoadingOverlay text="Loading Discover...." />}>
      <Content />
    </React.Suspense>
  );
};

export default AuthorizedApp;

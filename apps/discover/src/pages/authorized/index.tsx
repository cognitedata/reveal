import * as React from 'react';

import { WhiteLoader } from 'components/Loading';

const Content = React.lazy(
  () => import(/* webpackChunkName: 'main-content' */ './Content')
);

const AuthorizedApp = () => {
  return (
    <React.Suspense fallback={<WhiteLoader />}>
      <Content />
    </React.Suspense>
  );
};

export default AuthorizedApp;

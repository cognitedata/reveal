import React, { useMemo, Suspense } from 'react';
import { Route, Switch, Redirect, useLocation } from 'react-router';

import { Loader } from '@cognite/cogs.js';

const App = () => {
  const { pathname, search, hash } = useLocation();
  return (
    <Suspense fallback={<Loader />}>
      <Switch>
        <Redirect
          from="/:url*(/+)"
          to={{
            pathname: pathname.slice(0, -1),
            search,
            hash,
          }}
        />
        <Route
          key="/:project/raw-explorer"
          path="/:project/raw-explorer"
          component={useMemo(
            () => React.lazy(() => import('containers/RawExplorer')),
            []
          )}
        />
      </Switch>
    </Suspense>
  );
};

export default App;

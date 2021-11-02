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
          path="/:tenant/new-data-sets"
          component={useMemo(
            () => React.lazy(() => import('pages/DataSetsList/DataSetsList')),
            []
          )}
          exact
        />
        <Route
          path="/:tenant/new-data-sets/data-set/:dataSetId"
          component={useMemo(
            () =>
              React.lazy(() => import('pages/DataSetDetails/DataSetDetails')),
            []
          )}
        />
      </Switch>
    </Suspense>
  );
};

export default App;

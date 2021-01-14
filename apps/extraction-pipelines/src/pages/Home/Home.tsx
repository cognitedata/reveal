import React, { Suspense, useMemo } from 'react';
import { Loader } from '@cognite/cogs.js';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import { useAppEnv } from '../../hooks/useAppEnv';
import { INTEGRATIONS } from '../../utils/baseURL';

const Home = () => {
  const { search } = useLocation();
  const { project } = useAppEnv();
  return (
    <Suspense fallback={<Loader />}>
      <Switch>
        <Route
          exact
          path={`/:tenant/${INTEGRATIONS}`}
          component={useMemo(
            () =>
              React.lazy(
                () =>
                  import(
                    '../Integrations/Integrations'
                    /* webpackChunkName: "pnid_integrations" */
                  )
              ),
            []
          )}
        />
        <Redirect
          to={{
            pathname: `/${project}/${INTEGRATIONS}`,
            search,
          }}
        />
      </Switch>
    </Suspense>
  );
};

export default Home;

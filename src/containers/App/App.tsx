import React, { useEffect, useMemo, Suspense, useState } from 'react';
import { Route, Switch, Redirect, useLocation } from 'react-router';
import queryString from 'query-string';
import { trackUsage } from 'utils/Metrics';
import * as mixpanelConfig from 'mixpanel-browser';
import { useHistory } from 'react-router-dom';
import { getAuthState } from 'sdk-singleton';
import { Loader } from 'components/Common';
import ErrorBoundary from 'components/ErrorBoundary';

type RouteDef = {
  exact?: boolean;
  strict?: boolean;
  path: string;
  component: any;
  breadcrumbs?: any;
};

function PageNotFound() {
  return <h1>Page not found</h1>;
}

export default function App() {
  const { pathname, search, hash } = useLocation();
  const history = useHistory();
  const { location } = history;

  const [initialCdfEnv] = useState(
    queryString.parse(window.location.search).env as string
  );
  const { username } = getAuthState();

  const cdfEnv = queryString.parse(window.location.search).env as string;

  useEffect(() => {
    if (initialCdfEnv && !cdfEnv) {
      // if env is not visible via URL add it in
      history.replace({
        pathname: location.pathname,
        search: `?env=${initialCdfEnv}`,
      });
    }
  }, [cdfEnv, initialCdfEnv, history, location.pathname]);

  useEffect(() => {
    if (username) {
      const company = username.split('@').pop();
      // @ts-ignore
      mixpanelConfig.datastudio.add_group('company', company);
      // @ts-ignore
      mixpanelConfig.datastudio.identify(username);
    }
    trackUsage('App.Load');
  }, [username]);

  useEffect(() => {
    trackUsage('App.navigation');
  }, [location]);

  const routes = [
    {
      path: '/:tenant/functions',
      component: useMemo(
        () =>
          React.lazy(
            () =>
              import(
                'containers/Functions/'
                /* webpackChunkName: "functions" */
              )
          ),
        []
      ),
    },
    { path: '/:tenant/*', component: PageNotFound },
  ] as RouteDef[];

  return (
    <Suspense fallback={<Loader />}>
      <ErrorBoundary>
        <Switch>
          <Redirect
            from="/:url*(/+)"
            to={{
              pathname: pathname.slice(0, -1),
              search,
              hash,
            }}
          />
          {routes.map(route => (
            <Route
              key={route.path}
              exact={!!route.exact}
              stric={!!route.strict}
              path={route.path}
              component={route.component}
            />
          ))}
        </Switch>
      </ErrorBoundary>
    </Suspense>
  );
}

import React, { useEffect, useMemo, Suspense, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, Redirect, useLocation } from 'react-router';
import { init, setCdfEnv } from 'modules/app';
import queryString from 'query-string';
import { trackUsage } from 'utils/Metrics';
import * as mixpanelConfig from 'mixpanel-browser';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { RootState } from 'reducers';
import { getAuthState, loginAndAuthIfNeeded } from 'sdk-singleton';
import { Loader } from 'components/Common';

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
  const dispatch = useDispatch();
  const history = useHistory();
  const { location } = history;

  const {
    params: { tenant: pathTenant },
  } = useRouteMatch<{ tenant: string }>();
  const cdfEnv = queryString.parse(window.location.search).env as string;
  const [{ username, authenticated }, setAuthState] = useState(getAuthState());

  useEffect(() => {
    loginAndAuthIfNeeded(pathTenant, cdfEnv).then(() =>
      setAuthState(getAuthState())
    );
  }, [pathTenant, cdfEnv]);

  useEffect(() => {
    if (authenticated && pathTenant) {
      dispatch(init(pathTenant));
    }
  }, [dispatch, pathTenant, authenticated]);

  useEffect(() => {
    if (authenticated && cdfEnv) {
      dispatch(setCdfEnv(cdfEnv));
    }
  }, [dispatch, cdfEnv, authenticated]);

  const storeCdfEnv = useSelector((state: RootState) => state.app.cdfEnv);

  useEffect(() => {
    if (storeCdfEnv && !cdfEnv) {
      // if env is not visible via URL add it in
      history.replace({
        pathname: location.pathname,
        search: `?env=${storeCdfEnv}`,
      });
    }
  }, [cdfEnv, storeCdfEnv, history, location.pathname]);

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
          React.lazy(() =>
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
    </Suspense>
  );
}

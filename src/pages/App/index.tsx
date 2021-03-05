import React, { useEffect, useMemo, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { init, setCdfEnv } from 'modules/app';
import queryString from 'query-string';
import SwitchWithBreadcrumbs from 'components/SwitchWithBreadcrumbs';
import { trackUsage } from 'utils/Metrics';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { RootState } from 'reducers';
import { getAuthState } from 'sdk-singleton';
import Spinner from 'components/Spinner';

import pnidBreadcrumbs from 'pages/PnIDParsing/breadcrumbs';

function PageNotFound() {
  return <h1>Page not found</h1>;
}

export default function App() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { location } = history;

  const {
    params: { tenant: pathTenant },
  } = useRouteMatch<{ tenant: string }>();
  const cdfEnv = queryString.parse(window.location.search).env as string;
  const { username } = getAuthState();

  useEffect(() => {
    dispatch(init(pathTenant));
  }, [dispatch, pathTenant]);

  useEffect(() => {
    dispatch(setCdfEnv(cdfEnv));
  }, [dispatch, cdfEnv]);

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
      path: '/:tenant/pnid_parsing_new',
      breadcrumbs: pnidBreadcrumbs,
      component: useMemo(
        () =>
          React.lazy(
            () =>
              import(
                'pages/PnIDParsing/PnIDParsingRoutes'
                /* webpackChunkName: "pnid_parsing_new" */
              )
          ),
        []
      ),
    },
    { path: '/:tenant/*', component: PageNotFound },
  ];

  return (
    <Suspense fallback={<Spinner />}>
      <SwitchWithBreadcrumbs routes={routes} />
    </Suspense>
  );
}

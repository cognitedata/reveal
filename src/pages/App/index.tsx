import React, { useEffect, useMemo, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { RootState } from 'store';
import { getAuthState } from 'sdk-singleton';
import queryString from 'query-string';
import { trackUsage } from 'utils/Metrics';
import { setCdfEnv, setTenant, fetchUserGroups } from 'modules/app';
import SwitchWithBreadcrumbs from 'components/SwitchWithBreadcrumbs';
import Spinner from 'components/Spinner';
import pnidBreadcrumbs from 'pages/breadcrumbs';
import NotFound from 'pages/NotFound';

export default function App() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { location } = history;
  const { username } = getAuthState();

  const cdfEnv = queryString.parse(window.location.search).env as string;
  const {
    params: { tenant },
  } = useRouteMatch<{ tenant: string }>();

  const init = () => {
    dispatch(setTenant({ tenant }));
    dispatch(setCdfEnv({ cdfEnv }));
    dispatch(fetchUserGroups());
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant, cdfEnv]);

  const cdfEnvStore = useSelector((state: RootState) => state.app.cdfEnv);

  useEffect(() => {
    if (cdfEnvStore && !cdfEnv) {
      // if env is not visible via URL add it in
      history.replace({
        pathname: location.pathname,
        search: `?env=${cdfEnvStore}`,
      });
    }
  }, [cdfEnv, cdfEnvStore, history, location.pathname]);

  useEffect(() => {
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
                'pages/Routes'
                /* webpackChunkName: "pnid_parsing_new" */
              )
          ),
        []
      ),
    },
    { path: '/:tenant/*', component: NotFound },
  ];

  return (
    <Suspense fallback={<Spinner />}>
      <SwitchWithBreadcrumbs routes={routes} />
    </Suspense>
  );
}

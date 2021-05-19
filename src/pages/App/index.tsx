import React, { useEffect, useMemo, useContext, Suspense } from 'react';
import {
  useRouteMatch,
  useHistory,
  Route,
  Switch,
  Redirect,
  useLocation,
} from 'react-router-dom';
import {
  Loader,
  FileContextualizationContextProvider,
  DataExplorationProvider,
} from '@cognite/data-exploration';
import sdk, { getAuthState } from 'sdk-singleton';
import queryString from 'query-string';
import { trackUsage } from 'utils/Metrics';
import {
  ResourceActionsProvider,
  ResourceSelectionProvider,
  AppStateContext,
} from 'context';
import NotFound from 'pages/NotFound';
import { staticRoot } from 'routes/paths';

const Routes = React.lazy(() => import('routes'));

export default function App() {
  const { cdfEnv: cdfEnvFromContext, setCdfEnv, setTenant } = useContext(
    AppStateContext
  );
  const history = useHistory();
  const { location } = history;
  const { username } = getAuthState();
  const { pathname, search, hash } = useLocation();
  const {
    params: { tenant: tenantFromUrl },
  } = useRouteMatch<{ tenant: string }>();

  const cdfEnvFromUrl = queryString.parse(window.location.search).env as string;

  useEffect(() => {
    setTenant(tenantFromUrl);
    setCdfEnv(cdfEnvFromUrl);
  }, [tenantFromUrl, cdfEnvFromUrl, setTenant, setCdfEnv]);

  useEffect(() => {
    if (cdfEnvFromContext && !cdfEnvFromUrl) {
      history.replace({
        pathname: location.pathname,
        search: `?env=${cdfEnvFromContext}`,
      });
    }
  }, [cdfEnvFromUrl, cdfEnvFromContext, history, location.pathname]);

  useEffect(() => {
    trackUsage('App.Load');
  }, [username]);

  useEffect(() => {
    trackUsage('App.navigation');
  }, [location]);

  return (
    <Suspense fallback={<Loader />}>
      <FileContextualizationContextProvider>
        <ResourceSelectionProvider allowEdit mode="multiple">
          <ResourceActionsProvider>
            <DataExplorationProvider sdk={sdk}>
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
                  key={staticRoot}
                  path={staticRoot}
                  component={useMemo(() => Routes, [])}
                />
                <Route path="/:tenant/*" component={() => <NotFound />} />
              </Switch>
            </DataExplorationProvider>
          </ResourceActionsProvider>
        </ResourceSelectionProvider>
      </FileContextualizationContextProvider>
    </Suspense>
  );
}

import React, { useEffect, useMemo, useContext, Suspense } from 'react';
import { ReactQueryDevtools } from 'react-query/devtools';
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
import sdk, { getFlow } from '@cognite/cdf-sdk-singleton';

import queryString from 'query-string';
import { trackUsage } from 'utils/Metrics';
import {
  ResourceActionsProvider,
  ResourceSelectionProvider,
  AppStateContext,
} from 'context';
import NotFound from 'pages/NotFound';
import { staticRoot } from 'routes/paths';

import { setItemInStorage } from 'hooks/useLocalStorage';
import { useUserId } from 'hooks';
import { useUserInformation } from 'hooks/useUserInformation';

const Routes = React.lazy(() => import('routes'));

export default function App() {
  const {
    cdfEnv: cdfEnvFromContext,
    setCdfEnv,
    setProject,
  } = useContext(AppStateContext);
  const history = useHistory();
  const { location } = history;
  const { pathname, search, hash } = useLocation();
  const {
    params: { project: projectFromUrl },
  } = useRouteMatch<{ project: string }>();
  const { username } = useUserId();

  const cdfEnvFromUrl = queryString.parse(window.location.search).env as string;
  const LS_KEY = `${LS_KEY_PREFIX}${tenant}`;

  const { flow } = getFlow();
  const { data: userInfo } = useUserInformation();

  useEffect(() => {
    setProject(projectFromUrl);
    setCdfEnv(cdfEnvFromUrl);
  }, [projectFromUrl, cdfEnvFromUrl, setCdfEnv, setProject]);

  useEffect(() => {
    if (cdfEnvFromContext && !cdfEnvFromUrl) {
      history.replace({
        pathname: location.pathname,
        search: `?env=${cdfEnvFromContext}`,
      });
    }
  }, [cdfEnvFromUrl, cdfEnvFromContext, history, location.pathname]);

  useEffect(() => {
    if (username) {
      // to be used in metrics
      setItemInStorage('context-ui-pnid-username', username);
    }
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
            <DataExplorationProvider
              flow={flow}
              userInfo={userInfo}
              // @ts-ignore:next-line
              sdk={sdk}
              overrideURLMap={{
                pdfjsWorkerSrc:
                  '/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js',
              }}
            >
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
                <Route path="/:project/*" component={() => <NotFound />} />
              </Switch>
            </DataExplorationProvider>
          </ResourceActionsProvider>
        </ResourceSelectionProvider>
      </FileContextualizationContextProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </Suspense>
  );
}

import React, { useEffect, useContext, Suspense } from 'react';
import {
  useNavigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom';

import {
  ResourceActionsProvider,
  ResourceSelectionProvider,
  AppStateContext,
} from '@interactive-diagrams-app/context';
import { setItemInStorage, useUserId } from '@interactive-diagrams-app/hooks';
import { useUserInformation } from '@interactive-diagrams-app/hooks/useUserInformation';
import NotFound from '@interactive-diagrams-app/pages/NotFound';
import { staticRoot } from '@interactive-diagrams-app/routes/paths';
import { LS_KEY_METRICS } from '@interactive-diagrams-app/stringConstants';
import { trackUsage } from '@interactive-diagrams-app/utils/Metrics';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import queryString from 'query-string';

import sdk, { getFlow } from '@cognite/cdf-sdk-singleton';
import {
  Loader,
  FileContextualizationContextProvider,
  DataExplorationProvider,
} from '@cognite/data-exploration';

import { ids } from '../../cogs-variables';

const AppRoutes = React.lazy(() => import('@interactive-diagrams-app/routes'));

export default function App() {
  const {
    cdfEnv: cdfEnvFromContext,
    setCdfEnv,
    setProject,
  } = useContext(AppStateContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { project: projectFromUrl } = useParams<{ project: string }>();

  const { username } = useUserId();

  const cdfEnvFromUrl = queryString.parse(window.location.search).env as string;

  const { flow } = getFlow();
  const { data: userInfo } = useUserInformation();

  useEffect(() => {
    if (projectFromUrl) {
      setProject(projectFromUrl);
    }
    setCdfEnv(cdfEnvFromUrl);
  }, [projectFromUrl, cdfEnvFromUrl, setCdfEnv, setProject]);

  useEffect(() => {
    if (cdfEnvFromContext && !cdfEnvFromUrl) {
      navigate(`${location.pathname}?env=${cdfEnvFromContext}`, {
        replace: true,
      });
    }
  }, [cdfEnvFromUrl, cdfEnvFromContext, location.pathname, navigate]);

  useEffect(() => {
    if (username) {
      // to be used in metrics
      setItemInStorage(LS_KEY_METRICS, { username });
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
              styleScopeId={ids.styleScope}
              overrideURLMap={{
                pdfjsWorkerSrc:
                  '/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js',
              }}
            >
              <Routes>
                <Route key={staticRoot} path="/*" element={<AppRoutes />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DataExplorationProvider>
          </ResourceActionsProvider>
        </ResourceSelectionProvider>
      </FileContextualizationContextProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </Suspense>
  );
}

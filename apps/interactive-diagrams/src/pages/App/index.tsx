import React, { useEffect, useContext, Suspense } from 'react';
import {
  useNavigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import queryString from 'query-string';

import sdk, { getFlow } from '@cognite/cdf-sdk-singleton';
import { Icon } from '@cognite/cogs.js';
import {
  FileContextualizationContextProvider,
  DataExplorationProvider,
} from '@cognite/data-exploration';

import { ids } from '../../cogs-variables';
import {
  AppStateContext,
  ResourceActionsProvider,
  ResourceSelectionProvider,
} from '../../context';
import { setItemInStorage, useUserId } from '../../hooks';
import { useUserInformation } from '../../hooks/useUserInformation';
import AppRoutes from '../../routes';
import { staticRoot } from '../../routes/paths';
import { LS_KEY_METRICS } from '../../stringConstants';
import { trackUsage } from '../../utils/Metrics';
import PageNotFound from '../NotFound';

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

  if (!flow) {
    throw new Error('Flow is not defined');
  }

  return (
    <Suspense fallback={<Icon type="Loader" />}>
      <FileContextualizationContextProvider>
        <ResourceSelectionProvider allowEdit mode="multiple">
          <ResourceActionsProvider>
            <DataExplorationProvider
              flow={flow}
              userInfo={userInfo}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
                <Route path="*" element={<PageNotFound />} />
              </Routes>
            </DataExplorationProvider>
          </ResourceActionsProvider>
        </ResourceSelectionProvider>
      </FileContextualizationContextProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </Suspense>
  );
}

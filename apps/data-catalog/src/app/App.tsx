/* eslint-disable @cognite/no-number-z-index */
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Navigate, Routes } from 'react-router-dom';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { UserHistoryProvider } from '@user-history';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthContainer,
  createLink,
  getCluster,
  getProject,
} from '@cognite/cdf-utilities';
import { Loader, ToastContainer } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';

import AccessCheck from './AccessCheck';
import { translations } from './common/i18n';
import { DataSetsContextProvider } from './context';
import { useUserInformation } from './hooks/useUserInformation';
import GlobalStyles from './styles/GlobalStyles';
import { trackUsage } from './utils';

const DataSetsList = lazy(() => import('./pages/DataSetsList/DataSetsList'));
const DataSetDetails = lazy(
  () => import('./pages/DataSetDetails/DataSetDetails')
);

const App = () => {
  const appName = 'cdf-data-catalog';
  const projectName = getProject();
  const flagProviderApiToken = 'v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE';

  useEffect(() => {
    trackUsage({ e: 'data.sets.navigate' });
  }, []);

  const cluster = getCluster() ?? undefined;
  const project = getProject();
  const { data: user, isFetched } = useUserInformation();
  const userId = user?.id;

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <I18nWrapper translations={translations} defaultNamespace="data-catalog">
      <FlagProvider
        apiToken={flagProviderApiToken}
        appName={appName}
        projectName={projectName}
      >
        <GlobalStyles>
          <ToastContainer style={{ zIndex: 99999 }} />
          <AuthContainer
            title="Data catalog"
            sdk={sdk}
            login={loginAndAuthIfNeeded}
          >
            <UserHistoryProvider
              cluster={cluster}
              project={project}
              userId={userId}
            >
              <DataSetsContextProvider>
                <BrowserRouter>
                  <Suspense fallback={<Loader />}>
                    <AccessCheck>
                      <Routes>
                        <Route
                          path={`${projectName}/:appPath`}
                          element={<DataSetsList />}
                        />
                        <Route
                          path={`${projectName}/:appPath/data-set/:dataSetId`}
                          element={<DataSetDetails />}
                        />
                        <Route
                          path={`${projectName}/data-sets`}
                          element={
                            <Navigate
                              replace
                              to={createLink('/data-catalog')}
                            />
                          }
                        />
                      </Routes>
                    </AccessCheck>
                  </Suspense>
                </BrowserRouter>
              </DataSetsContextProvider>
            </UserHistoryProvider>
          </AuthContainer>
        </GlobalStyles>
        <ReactQueryDevtools initialIsOpen={false} />
      </FlagProvider>
    </I18nWrapper>
  );
};

export default App;

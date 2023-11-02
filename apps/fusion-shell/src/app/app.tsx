import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import styled from 'styled-components';

import { FUSION_PATH as FDX_PATH } from '@fdx/shared/constants/common';
import * as Sentry from '@sentry/react';
import { UserHistoryProvider } from '@user-history';

import { SubAppWrapper, getCluster, getProject } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import AllApps from './components/AllApps';
import LandingPage from './components/LandingPage/LandingPage';
import Navigation from './components/Navigation';
import NewLandingPage from './components/NewLandingPage/LandingPage';
import { UserProfilePage } from './components/UserProfilePage/UserProfilePage';
import { useUserInformation } from './hooks';

// eslint-disable-next-line @nx/enforce-module-boundaries
const FDXApp = lazy(() => import('@flexible-data-explorer/app/ShellApp'));

const RoutesWrapper = styled.div`
  height: 100%;
  [class$='style-scope'] {
    height: 100%;
  }
`;

const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);

export function App() {
  const routerBasename = '/:project';

  const project = getProject();
  const cluster = getCluster() ?? undefined;
  const { data: user, isFetched } = useUserInformation();
  const userId = user?.id;
  const { isEnabled: isNewLandingPageEnabled } = useFlag(
    'FUSION_UI_NEW_LANDING_PAGE_RELEASE_DEC_2023'
  );

  const [isReleaseBanner, setReleaseBanner] = useState<string>(
    () => localStorage.getItem(`isCDFReleaseBanner`) || 'true'
  );

  if (!isFetched) {
    return <Loader />;
  }

  const landingPage = isNewLandingPageEnabled ? (
    <NewLandingPage isReleaseBanner={isReleaseBanner} />
  ) : (
    <LandingPage isReleaseBanner={isReleaseBanner} />
  );

  return (
    <UserHistoryProvider cluster={cluster} project={project} userId={userId}>
      <SubAppWrapper>
        <BrowserRouter>
          <Navigation
            isReleaseBanner={isReleaseBanner}
            setReleaseBanner={setReleaseBanner}
          />

          <RoutesWrapper>
            <SentryRoutes>
              <Route path={routerBasename} element={landingPage} />
              <Route path={`${routerBasename}/apps`} element={<AllApps />} />
              <Route
                path={`${routerBasename}/profile`}
                element={<UserProfilePage />}
              />
              <Route
                path={`${routerBasename}${FDX_PATH}/*`}
                element={
                  <Suspense fallback={<Loader />}>
                    <FDXApp />
                  </Suspense>
                }
              />
            </SentryRoutes>
          </RoutesWrapper>
        </BrowserRouter>
      </SubAppWrapper>
    </UserHistoryProvider>
  );
}

export default App;

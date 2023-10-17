import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import styled from 'styled-components';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { FUSION_PATH as FDX_PATH } from '@flexible-data-explorer/app/constants/common';
import { UserHistoryProvider } from '@user-history';

import { SubAppWrapper, getCluster, getProject } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';

import AllApps from './components/AllApps';
import LandingPage from './components/LandingPage/LandingPage';
import Navigation from './components/Navigation';
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

export function App() {
  const routerBasename = '/:project';

  const project = getProject();
  const cluster = getCluster() ?? undefined;
  const { data: user, isFetched } = useUserInformation();
  const userId = user?.id;

  const [isReleaseBanner, setReleaseBanner] = useState<string>(
    () => localStorage.getItem(`isCDFReleaseBanner`) || 'true'
  );

  if (!isFetched) {
    return <Loader />;
  }

  return (
    <UserHistoryProvider cluster={cluster} project={project} userId={userId}>
      <SubAppWrapper>
        <BrowserRouter>
          <Navigation
            isReleaseBanner={isReleaseBanner}
            setReleaseBanner={setReleaseBanner}
          />

          <RoutesWrapper>
            <Routes>
              <Route
                path={routerBasename}
                element={<LandingPage isReleaseBanner={isReleaseBanner} />}
              />
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
            </Routes>
          </RoutesWrapper>
        </BrowserRouter>
      </SubAppWrapper>
    </UserHistoryProvider>
  );
}

export default App;

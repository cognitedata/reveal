import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import styled from 'styled-components';

import { UserHistoryProvider } from '@user-history';

import { SubAppWrapper, getCluster, getProject } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';

import AllApps from './components/AllApps';
import LandingPage from './components/LandingPage/LandingPage';
import Navigation from './components/Navigation';
import { UserProfilePage } from './components/UserProfilePage/UserProfilePage';
import { useUserInformation } from './hooks';

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
            </Routes>
          </RoutesWrapper>
        </BrowserRouter>
      </SubAppWrapper>
    </UserHistoryProvider>
  );
}

export default App;

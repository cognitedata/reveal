import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import styled from 'styled-components';

import { SubAppProvider, getCluster, getProject } from '@cognite/cdf-utilities';

import AllApps from './components/AllApps';
import LandingPage from './components/LandingPage/LandingPage';
import Navigation from './components/Navigation';
import { UserProfilePage } from './components/UserProfilePage/UserProfilePage';
import { useUserInformation } from './utils/hooks';

const RoutesWrapper = styled.div`
  height: 100%;
  [class$='style-scope'] {
    height: 100%;
  }
`;

export function App() {
  const project = getProject();
  const cluster = getCluster();
  const routerBasename = '/:project';
  const { data: user } = useUserInformation();

  const [isReleaseBanner, setReleaseBanner] = useState<string>(
    () => localStorage.getItem(`isCDFReleaseBanner`) || 'true'
  );

  return (
    <SubAppProvider
      user={{
        id: user?.id || '',
        cluster: cluster || '',
        project,
      }}
    >
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
    </SubAppProvider>
  );
}

export default App;

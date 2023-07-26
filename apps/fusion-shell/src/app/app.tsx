import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import styled from 'styled-components';

import {
  SubAppProvider,
  createLink,
  getCluster,
  getProject,
  isUsingUnifiedSignin,
} from '@cognite/cdf-utilities';

import AllApps from './components/AllApps';
import LandingPage from './components/LandingPage/LandingPage';
import Navigation from './components/Navigation';
import { UserProfilePage } from './components/UserProfilePage/UserProfilePage';
import { DynamicRoutes } from './DynamicRoutes';

const RoutesWrapper = styled.div`
  height: 100vh;
  padding-top: var(--cdf-ui-navigation-height);
  [class$='style-scope'] {
    height: 100%;
  }
`;
export function App() {
  const project = getProject();
  const cluster = getCluster();
  const routerBasename = isUsingUnifiedSignin() ? `/cdf/:project` : '/';

  const [isReleaseBanner, setReleaseBanner] = useState<string>(
    () => localStorage.getItem(`isCDFReleaseBanner`) || 'true'
  );

  return (
    <SubAppProvider
      user={{
        id: 'unknown',
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
              path="/"
              element={
                <Navigate to={createLink(`/${getProject()}`)} replace={true} />
              }
            />
            <Route
              path={routerBasename}
              element={<LandingPage isReleaseBanner={isReleaseBanner} />}
            />
            <Route path={`${routerBasename}/apps`} element={<AllApps />} />
            <Route
              path={`${routerBasename}/profile`}
              element={<UserProfilePage />}
            />
            {DynamicRoutes(routerBasename, isReleaseBanner)}
          </Routes>
        </RoutesWrapper>
      </BrowserRouter>
    </SubAppProvider>
  );
}

export default App;

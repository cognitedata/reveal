import { Suspense, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from 'react-router-dom';

import styled from 'styled-components';

import {
  SubAppProvider,
  getCluster,
  getProject,
  isUsingUnifiedSignin,
} from '@cognite/cdf-utilities';

import AllApps from '../components/AllApps';
import LandingPage from '../components/LandingPage/LandingPage';
import Navigation from '../components/Navigation';
import { UserProfilePage } from '../components/UserProfilePage/UserProfilePage';

const RoutesWrapper = styled.div`
  height: 100vh;
  padding-top: var(--cdf-ui-navigation-height);
  [class$='style-scope'] {
    height: 100%;
  }
`;

type SubAppPathElementProps = {
  isReleaseBanner: string;
};

const SubAppPathElement = ({ isReleaseBanner }: SubAppPathElementProps) => {
  const { subAppPath } = useParams<{ subAppPath: string }>();
  if (!subAppPath) {
    return <LandingPage isReleaseBanner={isReleaseBanner} />;
  }

  return (
    <Suspense fallback={<div>loading app...</div>}>
      {/* <SubApp useInShell /> */}
      <div></div>
    </Suspense>
  );
};

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
              element={<Navigate to={routerBasename} replace={true} />}
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
            <Route
              path={`${routerBasename}/:subAppPath/*`}
              element={<SubAppPathElement isReleaseBanner={isReleaseBanner} />}
            />
          </Routes>
        </RoutesWrapper>
      </BrowserRouter>
    </SubAppProvider>
  );
}

export default App;

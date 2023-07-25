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
  createLink,
  getCluster,
  getProject,
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
      <BrowserRouter basename="/cdf">
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
              path="/:project"
              element={<LandingPage isReleaseBanner={isReleaseBanner} />}
            />
            <Route path="/:project/apps" element={<AllApps />} />
            <Route path="/:project/profile" element={<UserProfilePage />} />
            <Route
              path="/:project/:subAppPath/*"
              element={<SubAppPathElement isReleaseBanner={isReleaseBanner} />}
            />
          </Routes>
        </RoutesWrapper>
      </BrowserRouter>
    </SubAppProvider>
  );
}

export default App;

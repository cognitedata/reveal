import { Outlet, Routes as ReactRoutes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { SearchBar } from './containers/SearchBar';
import { useFusionQuery } from './hooks/useFusionQuery';
import { HomePage } from './pages/HomePage';
import { InstancesPage } from './pages/Instances/InstancesPage';
import { ListPage } from './pages/ListPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SearchPage } from './pages/SearchPage';

const Routes = () => {
  useFusionQuery();

  return (
    <ReactRoutes>
      <Route index element={<OnboardingPage />} />

      <Route path="/:dataModel/:space/:version/" element={<Outlet />}>
        <Route index element={<HomePage />} />

        <Route
          element={
            <Container>
              <SearchBar />
              <Outlet />
            </Container>
          }
        >
          <Route path="search" element={<SearchPage />} />
          <Route path="list/:dataType" element={<ListPage />} />

          <Route
            path=":dataType/:nodeSpace/:externalId/overview?"
            element={<InstancesPage />}
          />
          <Route
            path=":dataType/:nodeSpace/:externalId/3d"
            element={<p>3D</p>}
          />
          <Route
            path=":dataType/:nodeSpace/:externalId/map"
            element={<p>Map</p>}
          />
        </Route>
      </Route>

      <Route path="*" element={<p>404, page not found</p>} />
    </ReactRoutes>
  );
};

export default Routes;

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

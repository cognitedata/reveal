import { Outlet, Routes as ReactRoutes, Route } from 'react-router-dom';

import styled from 'styled-components';

import { SearchBar } from './containers/search/SearchBar';
import { HomePage } from './pages/HomePage';
import { InstancesPage } from './pages/Instances/InstancesPage';
import { TimeseriesPage } from './pages/Instances/TimeseriesPage';
import { ListPage } from './pages/ListPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SearchPage } from './pages/SearchPage';
import { FDMProvider } from './providers/FDMProvider';

const Routes = () => {
  return (
    <ReactRoutes>
      <Route index element={<OnboardingPage />} />

      <Route
        path="/:dataModel/:space/:version/"
        element={
          <FDMProvider>
            <Outlet />
          </FDMProvider>
        }
      >
        <Route index element={<HomePage />} />

        <Route
          element={
            <Container>
              <Content>
                <SearchBar width="1024px" inverted />
              </Content>
              <Outlet />
            </Container>
          }
        >
          <Route path="search" element={<SearchPage />} />
          <Route path="list/:dataType" element={<ListPage />} />

          <Route path="timeseries/:externalId" element={<TimeseriesPage />} />

          <Route
            path=":dataType/:instanceSpace/:externalId/overview?"
            element={<InstancesPage />}
          />
          <Route
            path=":dataType/:instanceSpace/:externalId/3d"
            element={<p>3D</p>}
          />
          <Route
            path=":dataType/:instanceSpace/:externalId/map"
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

const Content = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

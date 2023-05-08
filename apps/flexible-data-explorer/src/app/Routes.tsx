import {
  Outlet,
  Routes as ReactRoutes,
  Route,
  Navigate,
} from 'react-router-dom';
import styled from 'styled-components';
import { SearchBar } from './containers/SearchBar';
import { useFusionQuery } from './hooks/useFusionQuery';
import { HomePage } from './pages/HomePage';
import { InstancesPage } from './pages/Instances/InstancesPage';
import { SearchPage } from './pages/SearchPage';
import { FDMProvider } from './providers/FDMProvider';

const Routes = () => {
  useFusionQuery();

  return (
    <ReactRoutes>
      <Route index element={<HomePage />} />

      <Route
        path="/"
        element={
          <FDMProvider>
            <Container>
              <SearchBar />
              <Outlet />
            </Container>
          </FDMProvider>
        }
      >
        <Route index element={<Navigate to="/search" />} />

        <Route path="/search" element={<SearchPage />} />

        <Route path=":space/:dataModel/:version/" element={<Outlet />}>
          <Route index element={<p>Landing page</p>} />

          {/* <Route path=":dataType" element={<p>Profile page</p>} /> */}

          <Route path="files/:externalId/overview?" element={<p>Files</p>} />
          <Route
            path="timeseries/:externalId/overview?"
            element={<p>Timeseries</p>}
          />

          <Route
            path=":dataType/:externalId/overview?"
            element={<InstancesPage />}
          />
          <Route path=":dataType/:externalId/3d" element={<p>3D</p>} />
          <Route path=":dataType/:externalId/map" element={<p>Map</p>} />
        </Route>

        <Route path="*" element={<p>404, page not found</p>} />
      </Route>
    </ReactRoutes>
  );
};

export default Routes;

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

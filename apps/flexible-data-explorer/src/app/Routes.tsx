import { Outlet, Routes as ReactRoutes, Route } from 'react-router-dom';

import styled from 'styled-components';

import { SearchBar } from './containers/search/SearchBar';
import { HomePage } from './pages/HomePage';
import { FilePage } from './pages/Instances/FilePage';
import { InstancesPage } from './pages/Instances/InstancesPage';
import { TimeseriesPage } from './pages/Instances/TimeseriesPage';
import { SearchPage } from './pages/SearchPage';
import { ThreeDPage } from './pages/ThreeDPage';
import { FDMProvider } from './providers/FDMProvider';

const Routes = () => {
  return (
    <ReactRoutes>
      <Route
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
                <SearchBar width="1026px" inverted />
              </Content>
              <Outlet />
            </Container>
          }
        >
          <Route path="search/:type?" element={<SearchPage />} />

          <Route path="3d" element={<ThreeDPage />} />

          <Route path="timeseries/:externalId" element={<TimeseriesPage />} />
          <Route path="file/:externalId" element={<FilePage />} />

          <Route path=":dataModel/:space/:version/">
            <Route
              path=":dataType/:instanceSpace/:externalId/overview?"
              element={<InstancesPage />}
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<p>404, page not found</p>} />
    </ReactRoutes>
  );
};

export default Routes;

const Container = styled.div`
  height: calc(100% - var(--top-bar-height));
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

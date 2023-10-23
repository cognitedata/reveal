import { Outlet, Routes as ReactRoutes, Route } from 'react-router-dom';

import styled from 'styled-components';

import { SearchBar } from './containers/search/SearchBar';
import { useViewModeParams } from './hooks/useParams';
import { HomePage } from './pages/HomePage';
import { FilePage } from './pages/Instances/FilePage';
import { InstancesPage } from './pages/Instances/InstancesPage';
import { TimeseriesPage } from './pages/Instances/TimeseriesPage';
import { SearchPage } from './pages/SearchPage';
import { ThreeDPage } from './pages/ThreeDPage';
import { FDMProvider } from './providers/FDMProvider';

const ViewContainer = () => {
  const [viewMode] = useViewModeParams();

  if (viewMode === '3d') {
    return <ThreeDPage />;
  }

  return <Outlet />;
};

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
                <SearchBarWrapper>
                  <SearchBar inverted />
                </SearchBarWrapper>
              </Content>
              <ViewContainer />
            </Container>
          }
        >
          <Route path="search" element={<SearchPage />} />

          <Route path="timeseries/:externalId" element={<TimeseriesPage />} />
          <Route path="file/:externalId" element={<FilePage />} />
          <Route
            path="sequence/:externalId"
            element={
              <center>
                <p>Work in progress...</p>
              </center>
            }
          />

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
  padding: 0 24px;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid rgba(83, 88, 127, 0.16);
`;

const SearchBarWrapper = styled.div`
  width: 1026px;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  gap: 16px;
`;

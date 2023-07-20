import React, { useEffect } from 'react';
import {
  Outlet,
  Routes as ReactRoutes,
  Route,
  useLocation,
} from 'react-router-dom';

import { DRAG_DROP_PORTAL_CLASS } from '@data-exploration/components';
import { ContainerProvider } from 'brandi-react';
import styled from 'styled-components/macro';

import { ToastContainer } from '@cognite/cogs.js';

import NoAccessWrapper from './components/NoAccessPage/NoAccessWrapper';
import { Spinner } from './components/Spinner/Spinner';
import { rootInjector, TOKENS } from './di';
import { isFDMv3 } from './flags';
import { getContainer } from './GlobalStyles';
import { useFusionQuery } from './hooks/useFusionQuery';
import { useInjection } from './hooks/useInjection';
import { DataModelsPage } from './modules/data-models/DataModelsPage';
import { DataModel } from './modules/solution/DataModel';
import zIndex from './utils/zIndex';

// Globally defined global
// GraphiQL package needs this to be run correctly
(window as any).global = window;

function App() {
  return (
    <ContainerProvider container={rootInjector}>
      <ToastContainer />
      <StyledWrapper>
        <NoAccessWrapper>
          <StyledPage>
            <Routes />
          </StyledPage>
        </NoAccessWrapper>
      </StyledWrapper>
    </ContainerProvider>
  );
}

export default App;

const StyledWrapper = styled.div`
  display: flex;
  flex-flow: column;
  height: 100vh;
  overflow: hidden;
`;

const StyledPage = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;

const DataModelSubRoutes = () => (
  <ReactRoutes>
    <Route>
      <Route index element={<DataModelsPage />} />
      <Route
        path=":space/:dataModelExternalId/:version/*"
        element={
          <ReactRoutes>
            <Route
              path="/*"
              element={
                <React.Suspense fallback={<Spinner />}>
                  <DataModel />
                </React.Suspense>
              }
            />
          </ReactRoutes>
        }
      ></Route>
    </Route>
  </ReactRoutes>
);

const Routes = () => {
  useFusionQuery();

  const location = useLocation();
  const fdmClient = useInjection(TOKENS.fdmClient);

  useEffect(() => {
    if (
      (fdmClient.version === 'beta' && isFDMv3()) ||
      (fdmClient.version === 'stable' && !isFDMv3())
    ) {
      window.location.reload();
    }
  }, [location.pathname, fdmClient]);

  useEffect(() => {
    const dragDropPortal: HTMLElement = document.createElement('div');
    dragDropPortal.classList.add(DRAG_DROP_PORTAL_CLASS);
    dragDropPortal.style.zIndex = `${zIndex.MAXIMUM}`;
    dragDropPortal.style.position = 'absolute';
    (getContainer() || document.body).appendChild(dragDropPortal);
  }, []);

  return (
    <React.Suspense fallback={<Spinner />}>
      <ReactRoutes>
        <Route path="/" element={<Outlet />}>
          <Route index element={<DataModelsPage />} />
          <Route path="/*" element={<DataModelSubRoutes />} />
          <Route
            path="/data-models-previous/*"
            element={<DataModelSubRoutes />}
          />
        </Route>
      </ReactRoutes>
    </React.Suspense>
  );
};

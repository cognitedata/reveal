import React, { useEffect } from 'react';
import {
  Outlet,
  Routes as ReactRoutes,
  Route,
  BrowserRouter,
} from 'react-router-dom';

import { DRAG_DROP_PORTAL_CLASS } from '@data-exploration/components';

import { getProject } from '@cognite/cdf-utilities';

import { Spinner } from './components/Spinner/Spinner';
import { getContainer } from './GlobalStyles';
import { useFusionQuery } from './hooks/useFusionQuery';
import { DataModelsPage } from './modules/data-models/DataModelsPage';
import { DataModel } from './modules/solution/DataModel';
import zIndex from './utils/zIndex';

// Globally defined global
// GraphiQL package needs this to be run correctly
(window as any).global = window;

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

interface RoutesWrapperProps {
  children: React.ReactNode;
}
const RoutesWrapper = ({ children }: RoutesWrapperProps) => {
  useFusionQuery();
  useEffect(() => {
    const dragDropPortal: HTMLElement = document.createElement('div');
    dragDropPortal.classList.add(DRAG_DROP_PORTAL_CLASS);
    dragDropPortal.style.zIndex = `${zIndex.MAXIMUM}`;
    dragDropPortal.style.position = 'absolute';
    (getContainer() || document.body).appendChild(dragDropPortal);
  }, []);
  return <>{children}</>;
};
const Routes = () => {
  const tenant = getProject();

  return (
    <BrowserRouter
      basename={tenant}
      window={window}
      children={
        <RoutesWrapper>
          <React.Suspense fallback={<Spinner />}>
            <ReactRoutes>
              <Route path="/" element={<Outlet />}>
                <Route index element={<DataModelsPage />} />
                <Route path="data-models/*" element={<DataModelSubRoutes />} />
              </Route>
            </ReactRoutes>
          </React.Suspense>
        </RoutesWrapper>
      }
    />
  );
};

export default Routes;

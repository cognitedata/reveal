import React, { useEffect } from 'react';
import {
  Outlet,
  Routes as ReactRoutes,
  Route,
  useLocation,
} from 'react-router-dom';

import { DRAG_DROP_PORTAL_CLASS } from '@data-exploration/components';

import { Spinner } from './components/Spinner/Spinner';
import { TOKENS } from './di';
import { isFDMv3 } from './flags';
import { getContainer } from './GlobalStyles';
import { useFusionQuery } from './hooks/useFusionQuery';
import { useInjection } from './hooks/useInjection';
import { DataModelsPage } from './modules/data-models/DataModelsPage';
import { DataModel } from './modules/solution/DataModel';
import zIndex from './utils/zIndex';

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
          <Route path="data-models/*" element={<DataModelSubRoutes />} />
          <Route
            path="data-models-previous/*"
            element={<DataModelSubRoutes />}
          />
        </Route>
      </ReactRoutes>
    </React.Suspense>
  );
};

export default Routes;

import React, { useEffect } from 'react';
import { Outlet, Routes as ReactRoutes, Route } from 'react-router-dom';

import { DRAG_DROP_PORTAL_CLASS } from '@data-exploration/components';

import { Spinner } from '../../app/components/Spinner/Spinner';
import { useFusionQuery } from '../../app/hooks/useFusionQuery';
import { DataModelsPage } from '../../app/modules/data-models/DataModelsPage';
import { DataModel } from '../../app/modules/solution/DataModel';
import zIndex from '../../app/utils/zIndex';

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

const Routes = () => {
  useFusionQuery();

  useEffect(() => {
    const dragDropPortal: HTMLElement = document.createElement('div');
    dragDropPortal.classList.add(DRAG_DROP_PORTAL_CLASS);
    dragDropPortal.style.zIndex = `${zIndex.MAXIMUM}`;
    dragDropPortal.style.position = 'absolute';
    document.body.appendChild(dragDropPortal);
  }, []);

  return (
    <React.Suspense fallback={<Spinner />}>
      <ReactRoutes>
        <Route path="/" element={<Outlet />}>
          <Route index element={<DataModelsPage />} />
          <Route path="/*" element={<DataModelSubRoutes />} />
        </Route>
      </ReactRoutes>
    </React.Suspense>
  );
};

export default Routes;

import React, { useEffect } from 'react';
import {
  Outlet,
  Routes as ReactRoutes,
  Route,
  useLocation,
} from 'react-router-dom';
import { DataModelsPage } from './modules/data-models/DataModelsPage';
import { DataModel } from './modules/solution/DataModel';
import { Spinner } from './components/Spinner/Spinner';
import { useFusionQuery } from './hooks/useFusionQuery';
import { useMixpanelPathTracking } from './hooks/useMixpanel';
import { isFDMv3 } from './flags';
import { useInjection } from './hooks/useInjection';
import { TOKENS } from './di';

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

  return (
    <React.Suspense fallback={<Spinner />}>
      <HOCPathTracking>
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
      </HOCPathTracking>
    </React.Suspense>
  );
};

export default Routes;

const HOCPathTracking = ({ children }: { children: React.ReactNode }) => {
  useMixpanelPathTracking();
  return <>{children}</>;
};

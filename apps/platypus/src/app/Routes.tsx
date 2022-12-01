import React from 'react';
import { Outlet, Routes as ReactRoutes, Route } from 'react-router-dom';
import { DataModelsPage } from './modules/data-models/DataModelsPage';
import { DataModel } from './modules/solution/DataModel';
import { NavigationDataModel } from './components/Navigations/NavigationDataModel';
import { Spinner } from './components/Spinner/Spinner';
import { useFusionQuery } from './hooks/useFusionQuery';
import { useMixpanelPathTracking } from './hooks/useMixpanel';

const Routes = () => {
  useFusionQuery();

  return (
    <React.Suspense fallback={<Spinner />}>
      <HOCPathTracking>
        <ReactRoutes>
          <Route path="/" element={<Outlet />}>
            <Route index element={<DataModelsPage />} />
            <Route
              path="data-models/*"
              element={
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
                                <NavigationDataModel />
                                <React.Suspense fallback={<Spinner />}>
                                  <DataModel />
                                </React.Suspense>
                              </React.Suspense>
                            }
                          />
                        </ReactRoutes>
                      }
                    ></Route>
                  </Route>
                </ReactRoutes>
              }
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

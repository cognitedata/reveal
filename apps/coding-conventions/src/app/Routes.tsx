import { useEffect } from 'react';
import { Outlet, Routes as ReactRoutes, Route } from 'react-router-dom';

import { useFusionQuery } from './hooks/useFusionQuery';
import { ConventionsPage } from './pages/ConventionsPage';
import { EditPage } from './pages/edit/EditPage';
import { Database } from './service/storage/Database';

const Routes = () => {
  useFusionQuery();
  useEffect(() => {
    Database.init();
  }, []);

  return (
    <ReactRoutes>
      <Route path="/" element={<Outlet />}>
        <Route index element={<ConventionsPage />} />
        <Route
          path="/definition/edit/:systemId/:conventionId/:definitionsId/:type"
          element={<ConventionsPage editDefinition />}
        />

        <Route
          path="/definition/edit/:systemId/:conventionId/:dependsOnId/:definitionsId/:type"
          element={<ConventionsPage editDefinition />}
        />

        <Route
          path="/conventions/:systemId/edit/:conventionId"
          element={<EditPage />}
        />
        <Route
          path="/conventions/:systemId/edit/:conventionId/:dependsOnId"
          element={<EditPage />}
        />
        <Route
          path="/conventions/:systemId/test"
          element={<ConventionsPage test />}
        />
        <Route
          path="/conventions/:systemId/validate"
          element={<ConventionsPage validate />}
        />
        <Route path="/conventions/:systemId" element={<ConventionsPage />} />
      </Route>
    </ReactRoutes>
  );
};

export default Routes;

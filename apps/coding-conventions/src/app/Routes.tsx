import React from 'react';
import { Outlet, Routes as ReactRoutes, Route } from 'react-router-dom';
import { useFusionQuery } from './hooks/useFusionQuery';
import { ConventionsPage } from './pages/ConventionsPage';
import { EditPage } from './pages/edit/EditPage';

const Routes = () => {
  useFusionQuery();

  return (
    <ReactRoutes>
      <Route path="/" element={<Outlet />}>
        <Route index element={<ConventionsPage />} />
        <Route
          path="/conventions/:systemId/edit/:conventionId"
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

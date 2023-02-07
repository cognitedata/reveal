import React from 'react';
import { Outlet, Routes as ReactRoutes, Route } from 'react-router-dom';
import { useFusionQuery } from './hooks/useFusionQuery';
import { ConventionsPage } from './pages/ConventionsPage';
import { ValidationsPage } from './pages/validation/ValidationsPage';
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
        <Route path="/conventions/:systemId" element={<ConventionsPage />} />
        <Route path="/validations/:id" element={<ValidationsPage />} />
      </Route>
    </ReactRoutes>
  );
};

export default Routes;

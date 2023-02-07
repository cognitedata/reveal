import React from 'react';
import { Outlet, Routes as ReactRoutes, Route } from 'react-router-dom';
import { useFusionQuery } from './hooks/useFusionQuery';
import { ConventionsPage } from './pages/ConventionsPage';
import { ValidationsPage } from './pages/validation/ValidationsPage';
import { EditTablePage } from './pages/pasteView/EditTablePage';

const Routes = () => {
  useFusionQuery();

  return (
    <ReactRoutes>
      <Route path="/" element={<Outlet />}>
        <Route index element={<ConventionsPage />} />
        <Route path="/edit/:id" element={<EditTablePage />} />
        <Route path="/conventions/:systemId" element={<ConventionsPage />} />
        <Route path="/validations/:id" element={<ValidationsPage />} />
      </Route>
    </ReactRoutes>
  );
};

export default Routes;

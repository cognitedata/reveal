import React from 'react';
import { Outlet, Routes as ReactRoutes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { useFusionQuery } from './hooks/useFusionQuery';
import { ContentionsPage } from './pages/conventions/ConventionsPage';

const Routes = () => {
  useFusionQuery();

  return (
    <ReactRoutes>
      <Route path="/" element={<Outlet />}>
        <Route index element={<HomePage />} />

        <Route path="/conventions/:id" element={<ContentionsPage />} />
      </Route>
    </ReactRoutes>
  );
};

export default Routes;

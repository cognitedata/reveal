import React from 'react';
import { Outlet, Routes as ReactRoutes, Route } from 'react-router-dom';

import { HomePage } from './pages/HomePage';
import { IoTPage } from './pages/IoTPage';

const Routes = () => {
  return (
    <ReactRoutes>
      <Route path="/" element={<Outlet />}>
        <Route index element={<HomePage />} />
        <Route path="/:id" element={<IoTPage />} />
      </Route>
    </ReactRoutes>
  );
};

export default Routes;

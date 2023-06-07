import React from 'react';
import { Routes as ReactRoutes, Route } from 'react-router-dom';

import { IndustryCanvasPage } from '@fusion/industry-canvas';

import { useFusionQuery } from './hooks/useFusionQuery';
import { routes } from './routes';

const Routes = () => {
  useFusionQuery();

  return (
    <ReactRoutes>
      <Route path={routes.root.path} element={<IndustryCanvasPage />} />
    </ReactRoutes>
  );
};

export default Routes;

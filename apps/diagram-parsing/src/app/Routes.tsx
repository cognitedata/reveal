import React from 'react';
import { Outlet, Routes as ReactRoutes, Route } from 'react-router-dom';

import { useFusionQuery } from './hooks/useFusionQuery';
import { useTranslation } from './hooks/useTranslation';
import { HomePage, EmptyView } from './pages';

const Routes = () => {
  const { t } = useTranslation();

  useFusionQuery();

  return (
    <ReactRoutes>
      <Route path="/" element={<Outlet />}>
        <Route index element={<HomePage />} />
        <Route path="/:dataSetId?" element={<HomePage />} />
        <Route
          path="*"
          element={
            <EmptyView
              body={t('page-not-found-body')}
              illustration="EmptyStateSearchSad"
              title={t('page-not-found-title')}
            />
          }
        />
      </Route>
    </ReactRoutes>
  );
};

export default Routes;

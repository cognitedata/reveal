import React, { Suspense } from 'react';
import { Loader, ToastContainer } from '@cognite/cogs.js';
import { Switch, Redirect, useLocation } from 'react-router-dom';
import { EXTRACTION_PIPELINES_PATH } from 'utils/baseURL';
import { useAppEnv } from 'hooks/useAppEnv';
import { Routes } from 'routing/RoutingConfig';
import { SelectedIntegrationProvider } from 'hooks/useSelectedIntegration';

const Home = () => {
  const { search } = useLocation();
  const { project } = useAppEnv();
  return (
    <Suspense fallback={<Loader />}>
      <ToastContainer />
      <SelectedIntegrationProvider>
        <Switch>
          <Routes />
          <Redirect
            to={{
              pathname: `/${project}/${EXTRACTION_PIPELINES_PATH}`,
              search,
            }}
          />
        </Switch>
      </SelectedIntegrationProvider>
    </Suspense>
  );
};

export default Home;

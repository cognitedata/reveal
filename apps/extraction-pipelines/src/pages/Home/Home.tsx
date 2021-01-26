import React, { Suspense } from 'react';
import { Loader } from '@cognite/cogs.js';
import { Switch, Redirect, useLocation } from 'react-router-dom';
import { useAppEnv } from '../../hooks/useAppEnv';
import { INTEGRATIONS } from '../../utils/baseURL';
import { Routes } from '../../routing/RoutingConfig';
import { SelectedIntegrationProvider } from '../../hooks/useSelectedIntegration';

const Home = () => {
  const { search } = useLocation();
  const { project } = useAppEnv();
  return (
    <Suspense fallback={<Loader />}>
      <SelectedIntegrationProvider>
        <Switch>
          <Routes />
          <Redirect
            to={{
              pathname: `/${project}/${INTEGRATIONS}`,
              search,
            }}
          />
        </Switch>
      </SelectedIntegrationProvider>
    </Suspense>
  );
};

export default Home;

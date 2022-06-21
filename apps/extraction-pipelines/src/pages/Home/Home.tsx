import React, { Suspense } from 'react';
import { Loader, ToastContainer } from '@cognite/cogs.js';
import { Switch, Redirect } from 'react-router-dom';
import { EXTRACTION_PIPELINES_PATH } from 'utils/baseURL';
import { Routes } from 'routing/RoutingConfig';
import { SelectedExtpipeProvider } from 'hooks/useSelectedExtpipe';
import { createRedirectLink } from 'utils/utils';

const Home = () => {
  return (
    <Suspense fallback={<Loader />}>
      <ToastContainer />
      <SelectedExtpipeProvider>
        <Switch>
          <Routes />
          <Redirect
            to={{
              pathname: createRedirectLink(`/${EXTRACTION_PIPELINES_PATH}`),
            }}
          />
        </Switch>
      </SelectedExtpipeProvider>
    </Suspense>
  );
};

export default Home;

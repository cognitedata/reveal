import React, { Suspense } from 'react';
import { Loader, ToastContainer } from '@cognite/cogs.js';
import { Switch, Redirect } from 'react-router-dom';
import { EXTRACTION_PIPELINES_PATH } from 'utils/baseURL';
import { Routes } from 'routing/RoutingConfig';
import { createLink } from '@cognite/cdf-utilities';

const Home = () => {
  return (
    <Suspense fallback={<Loader />}>
      <ToastContainer />
      <Switch>
        <Routes />
        <Redirect
          to={{
            pathname: createLink(`/${EXTRACTION_PIPELINES_PATH}`),
          }}
        />
      </Switch>
    </Suspense>
  );
};

export default Home;

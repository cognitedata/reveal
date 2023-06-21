import React, { useEffect, Suspense, useState } from 'react';
import { useLocation, useNavigate, Route, Routes } from 'react-router-dom';

import styled from 'styled-components';

import { Loader } from '@functions-ui/components/Common';
import ErrorBoundary from '@functions-ui/components/ErrorBoundary';
import { useUserInformation } from '@functions-ui/utils/hooks';
import { handleUserIdentification } from '@functions-ui/utils/Metrics';
import queryString from 'query-string';

import Functions from './Functions';

type RouteDef = {
  exact?: boolean;
  strict?: boolean;
  path: string;
  component: any;
  breadcrumbs?: any;
};

function PageNotFound() {
  return <h1>Page not found</h1>;
}

export default function RootApp() {
  const navigate = useNavigate();

  const location = useLocation();
  const [initialCdfEnv] = useState(
    queryString.parse(window.location.search).env as string
  );
  const { data: userInfo } = useUserInformation();
  const username = userInfo?.displayName || userInfo?.mail;

  const cdfEnv = queryString.parse(window.location.search).env as string;

  useEffect(() => {
    if (initialCdfEnv && !cdfEnv) {
      // if env is not visible via URL add it in
      navigate(location.pathname, {
        state: { search: `?env=${initialCdfEnv}` },
      });
    }
  }, [cdfEnv, initialCdfEnv, navigate, location.pathname]);

  useEffect(() => {
    if (username) {
      handleUserIdentification(username);
    }
  }, [username]);

  const routes = [
    {
      path: '/:tenant/functions',
      component: Functions,
    },
    { path: '/:tenant/*', component: PageNotFound },
  ] as RouteDef[];

  // inside component

  // check if pathname ends with '/'
  if (location.pathname.slice(-1) === '/') {
    navigate(location.pathname.slice(0, -1) + location.search + location.hash, {
      replace: true,
    });
  }

  return (
    <Suspense fallback={<Loader />}>
      <StyledRootApp>
        <ErrorBoundary>
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.component />}
              />
            ))}
          </Routes>
        </ErrorBoundary>
      </StyledRootApp>
    </Suspense>
  );
}

const StyledRootApp = styled.div`
  padding: 20px;
  @media (min-width: 992px) {
    padding: 20px 50px;
  }
`;

import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { Loader } from '@cognite/cogs.js';

import { useUserCapabilities } from './hooks/useUserCapabilities';
import { LazyWrapper } from './modules/Common/Components/LazyWrapper';
import NoAccessPage from './pages/NoAccessPage';
import NotFound from './pages/NotFound';

const RouteWrapper: React.FC<{
  capabilities: { acl: string; actions: string[] }[];
  children: JSX.Element;
}> = ({ capabilities, children }): JSX.Element => {
  const { data: hasCapabilities, isFetched } =
    useUserCapabilities(capabilities);
  const { pathname } = useLocation();

  if (!isFetched) {
    return <Loader />;
  }

  if (!hasCapabilities) {
    return (
      <NoAccessPage capabilities={capabilities} requestedPathName={pathname} />
    );
  }

  return <>{children}</>;
};

const routes = [
  {
    path: '/:tenant/vision',
    importFn: () => import('./pages/Home'),
    capabilities: [
      {
        acl: 'filesAcl',
        actions: ['READ', 'WRITE'],
      },
      {
        acl: 'groupsAcl',
        actions: ['LIST'],
      },
    ],
  },
  {
    path: '/:tenant/vision/workflow/review/:fileId',
    importFn: () => import('./modules/Review/Containers/Review'),
    capabilities: [
      {
        acl: 'filesAcl',
        actions: ['READ', 'WRITE'],
      },
      {
        acl: 'groupsAcl',
        actions: ['LIST'],
      },
    ],
  },
  {
    path: '/:tenant/vision/workflow/*',
    importFn: () => import('./pages/Process'),
    capabilities: [
      {
        acl: 'filesAcl',
        actions: ['READ', 'WRITE'],
      },
      {
        acl: 'groupsAcl',
        actions: ['LIST'],
      },
      {
        acl: 'annotationsAcl',
        actions: ['WRITE'],
      },
    ],
  },
  {
    path: '/:tenant/vision/explore',
    importFn: () => import('./modules/Explorer/Containers/Explorer'),
    capabilities: [
      {
        acl: 'filesAcl',
        actions: ['READ', 'WRITE'],
      },
      {
        acl: 'groupsAcl',
        actions: ['LIST'],
      },
    ],
  },
  {
    path: '/:tenant/vision/models',
    importFn: () => import('./modules/AutoML/Components/AutoML'),
    capabilities: [
      {
        acl: 'groupsAcl',
        actions: ['LIST'],
      },
      {
        acl: 'visionModelAcl',
        actions: ['READ'],
      },
    ],
  },
];

export function AppRoutes() {
  return (
    <Routes>
      {routes.map((r) => (
        <Route
          key={r.path}
          path={r.path}
          element={
            <RouteWrapper capabilities={r.capabilities}>
              <LazyWrapper importFn={r.importFn} />
            </RouteWrapper>
          }
        />
      ))}

      <Route element={<NotFound />} />
    </Routes>
  );
}

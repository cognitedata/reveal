import React from 'react';
import { Loader } from '@cognite/cogs.js';
import { Route, Switch, useLocation } from 'react-router-dom';
import NotFound from 'src/pages/NotFound';
import { LazyWrapper } from 'src/modules/Common/Components/LazyWrapper';
import NoAccessPage from 'src/pages/NoAccessPage';
import { useUserCapabilities } from './hooks/useUserCapabilities';

const RouteWrapper: React.FC<{
  capabilities: { acl: string; actions: string[] }[];
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
    exact: true,
    path: '/:tenant/vision',
    importFn: () => import('src/pages/Home'),
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
    exact: true,
    path: '/:tenant/vision/workflow/review/:fileId',
    importFn: () => import('src/modules/Review/Containers/Review'),
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
    exact: false,
    path: '/:tenant/vision/workflow/:step',
    importFn: () => import('src/pages/Process'),
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
    exact: true,
    path: '/:tenant/vision/explore',
    importFn: () => import('src/modules/Explorer/Containers/Explorer'),
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
    exact: true,
    path: '/:tenant/vision/models',
    importFn: () => import('src/modules/AutoML/Components/AutoML'),
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

export function Routes() {
  return (
    <Switch>
      {routes.map((r) => (
        <Route key={r.path} exact={r.exact} path={r.path}>
          <RouteWrapper capabilities={r.capabilities}>
            <LazyWrapper importFn={r.importFn} />
          </RouteWrapper>
        </Route>
      ))}

      <Route component={NotFound} />
    </Switch>
  );
}

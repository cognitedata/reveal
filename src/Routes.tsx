import React, { useMemo } from 'react';
import { Loader } from '@cognite/cogs.js';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import NotFound from 'src/pages/NotFound';
import { LazyWrapper } from 'src/modules/Common/Components/LazyWrapper';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import NoAccessPage from 'src/pages/NoAccessPage';

function routeWrapper(
  Component: any
): (routerProps: RouteComponentProps) => any {
  return (routeProps: RouteComponentProps) => {
    return <Component {...routeProps} />;
  };
}

const routes = [
  {
    exact: true,
    path: '/:tenant/vision',
    component: (props: RouteComponentProps) => {
      const compRoute = useMemo(() => () => import('src/pages/Home'), []);

      return <LazyWrapper routeProps={props} importFn={compRoute} />;
    },
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
    component: (props: RouteComponentProps) => {
      const compRoute = useMemo(
        () => () => import('src/modules/Review/Containers/Review'),
        []
      );

      return <LazyWrapper routeProps={props} importFn={compRoute} />;
    },
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
    component: (props: RouteComponentProps) => {
      const compRoute = useMemo(() => () => import('src/pages/Process'), []);

      return <LazyWrapper routeProps={props} importFn={compRoute} />;
    },
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
    component: (props: RouteComponentProps) => {
      const compRoute = useMemo(
        () => () => import('src/modules/Explorer/Containers/Explorer'),
        []
      );

      return <LazyWrapper routeProps={props} importFn={compRoute} />;
    },
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
    component: (props: RouteComponentProps) => {
      const compRoute = useMemo(
        () => () => import('src/modules/AutoML/Components/AutoML'),
        []
      );

      return <LazyWrapper routeProps={props} importFn={compRoute} />;
    },
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
  const { flow } = getFlow();
  const {
    data: filesRead,
    isFetched: filesReadFetched,
    error: filesReadError,
  } = usePermissions(flow, 'filesAcl', 'READ');
  const {
    data: filesWrite,
    isFetched: filesWriteFetched,
    error: filesWriteError,
  } = usePermissions(flow, 'filesAcl', 'WRITE');
  const {
    data: groupsList,
    isFetched: groupsListFetched,
    error: groupsReadError,
  } = usePermissions(flow, 'filesAcl', 'WRITE');

  const permissionError = filesReadError || filesWriteError || groupsReadError;
  const loading = !filesReadFetched || !filesWriteFetched || !groupsListFetched;

  if (permissionError) {
    return <p>Error retrieving permissions</p>;
  }
  if (loading) {
    return <Loader />;
  }

  if (!filesRead || !filesWrite || !groupsList) {
    return (
      <NoAccessPage
        capabilities={[
          {
            acl: 'filesAcl',
            actions: ['READ', 'WRITE'],
          },
          {
            acl: 'groupsAcl',
            actions: ['LIST'],
          },
        ]}
      />
    );
  }

  return (
    <Switch>
      {routes.map((r) => (
        <Route
          key={r.path}
          exact={r.exact}
          path={r.path}
          render={routeWrapper(r.component)}
        />
      ))}

      <Route component={NotFound} />
    </Switch>
  );
}

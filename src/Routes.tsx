import React, { useMemo } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { useUserContext } from '@cognite/cdf-utilities';
import NotFound from 'src/pages/NotFound';
import { LazyWrapper } from 'src/modules/Common/Components/LazyWrapper';
import { AuthenticatedUserWithGroups } from '@cognite/cdf-utilities/dist/types';
import { userHasCapabilities } from 'src/utils';
import NoAccessPage from 'src/pages/NoAccessPage';

function routeWrapper(
  Component: any,
  user: AuthenticatedUserWithGroups,
  capabilities: [{ acl: string; actions: [] }]
): (routerProps: RouteComponentProps) => any {
  return (routeProps: RouteComponentProps) => {
    if (!userHasCapabilities(user, capabilities)) {
      return <NoAccessPage capabilities={capabilities} />;
    }
    return <Component {...routeProps} user={user} />;
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
  const user = useUserContext();

  return (
    <Switch>
      {routes.map((r) => (
        <Route
          key={r.path}
          exact={r.exact}
          path={r.path}
          render={routeWrapper(
            r.component,
            user,
            r.capabilities as [{ acl: string; actions: [] }]
          )}
        />
      ))}

      <Route component={NotFound} />
    </Switch>
  );
}

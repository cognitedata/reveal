import React, { useMemo } from 'react';
import { Loader } from '@cognite/cogs.js';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import NotFound from 'src/pages/NotFound';
import { LazyWrapper } from 'src/modules/Common/Components/LazyWrapper';
import NoAccessPage from 'src/pages/NoAccessPage';
import { useUserCapabilities } from './hooks/useUserCapabilities';

const RouteWrapper = ({
  Component,
  capabilities,
  ...routeProps
}: {
  Component: any;
  capabilities: { acl: string; actions: string[] }[];
} & RouteComponentProps): JSX.Element => {
  const { data: hasCapabilities, isFetched } =
    useUserCapabilities(capabilities);

  if (!isFetched) {
    return <Loader />;
  }

  if (!hasCapabilities) {
    return <NoAccessPage capabilities={capabilities} />;
  }

  return <Component {...routeProps} />;
};

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
  return (
    <Switch>
      {routes.map((r) => (
        <Route
          key={r.path}
          exact={r.exact}
          path={r.path}
          render={(routeProps) => (
            <RouteWrapper
              Component={r.component}
              capabilities={r.capabilities}
              {...routeProps}
            />
          )}
        />
      ))}

      <Route component={NotFound} />
    </Switch>
  );
}

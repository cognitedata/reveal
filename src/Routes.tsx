import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { useUserContext } from '@cognite/cdf-utilities';
import NotFound from 'src/pages/NotFound';
import { LazyWrapper } from 'src/modules/Common/Components/LazyWrapper';
import { AuthenticatedUserWithGroups } from '@cognite/cdf-utilities/dist/types';
import { userHasCapabilities } from 'src/utils';
import NoAccessPage from 'src/pages/NoAccessPage';

function routeWrapper(
  Component: any,
  user: AuthenticatedUserWithGroups
): (routerProps: RouteComponentProps) => any {
  return (routeProps: RouteComponentProps) => {
    const capabilities = [
      {
        acl: 'filesAcl',
        actions: ['READ', 'WRITE'],
      },
    ];
    if (true) {
      return <NoAccessPage capabilities={capabilities} />;
    }
    return <Component {...routeProps} user={user} />;
  };
}

const routes = [
  {
    exact: true,
    path: '/:tenant/vision',
    component: (props: RouteComponentProps) =>
      LazyWrapper(props, () => import('src/pages/Home')),
  },
  {
    exact: true,
    path: '/:tenant/vision/workflow/review/:fileId',
    component: (props: RouteComponentProps) =>
      LazyWrapper(props, () => import('src/modules/Preview/Containers/Review')),
  },
  {
    exact: false,
    path: '/:tenant/vision/workflow/:step',
    component: (props: RouteComponentProps) =>
      LazyWrapper(
        props,
        () => import('src/modules/Workflow/WorkflowContainer')
      ),
  },
  {
    exact: true,
    path: '/:tenant/vision/explore',
    component: (props: RouteComponentProps) =>
      LazyWrapper(
        props,
        () => import('src/modules/Explorer/Containers/Explorer')
      ),
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
          component={routeWrapper(r.component, user)}
        />
      ))}

      <Route component={NotFound} />
    </Switch>
  );
}

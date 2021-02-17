import React, { useEffect } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { useUserContext } from '@cognite/cdf-utilities';
import NotFound from 'src/pages/NotFound';
import { LazyWrapper } from 'src/components/LazyWrapper';
import { AuthenticatedUserWithGroups } from '@cognite/cdf-utilities/dist/types';
import { handleUserIdentification } from 'src/utils/config';
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
    component: (props: RouteComponentProps) =>
      LazyWrapper(props, () => import('src/pages/Home')),
  },
  {
    exact: false,
    path: '/:tenant/vision/workflow/:step',
    component: (props: RouteComponentProps) =>
      LazyWrapper(props, () => import('src/pages/Workflow/WorkflowContainer')),
  },
];

export function Routes() {
  const user = useUserContext();

  useEffect(() => {
    handleUserIdentification(user.username || 'user-without-username');
  }, [user]);

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

import React, { useEffect } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { useUserContext } from '@cognite/cdf-utilities';
import { handleUserIdentification } from 'utils/userTracking';
import NotFound from 'components/NotFound';
import { LazyWrapper } from 'components/LazyWrapper';
import { AuthenticatedUserWithGroups } from '@cognite/cdf-utilities/dist/types';
import { userHasCapabilities } from './utils';
import NoAccessPage from './components/NoAccessPage';

// checks access to 3d and passes down the user prop
// (user prop is unnecessary, might be refactored in favor of using user context)
function routeWrapper(
  Component: any,
  user: AuthenticatedUserWithGroups
): (routerProps: RouteComponentProps) => any {
  return (routeProps: RouteComponentProps) => {
    if (
      !userHasCapabilities(user, [
        {
          acl: 'threedAcl',
          actions: ['READ'],
        },
      ])
    ) {
      return <NoAccessPage />;
    }
    return <Component {...routeProps} user={user} />;
  };
}

const routes = [
  {
    exact: true,
    path: '/:tenant/3d-models',
    component: (props) =>
      LazyWrapper(
        props,
        () => import('pages/AllModels' /* webpackChunkName: "3d_models"  */)
      ),
  },
  {
    exact: true,
    path: '/:tenant/3d-models/:modelId/revisions/:revisionId',
    component: (props) =>
      LazyWrapper(
        props,
        () =>
          import(
            'pages/RevisionDetails' /* webpackChunkName: "3d_revisions"  */
          )
      ),
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

import React from 'react';
import { Route, RouteProps, Redirect } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import { Location } from 'history';

import { WhiteLoader } from 'components/loading';

import { showErrorMessage } from '../components/toast';

const PageLayout: React.FC<RouteProps> = ({ children }) => <>{children}</>;

export const PageRoute = ({ ...rest }: RouteProps) => {
  return (
    <PageLayout location={rest.location as Location}>
      <Route {...rest} />
    </PageLayout>
  );
};

export type ProtectedRouteProps = {
  isAuthenticated: boolean;
  returnPath: string;
} & RouteProps;

export const ProtectedRoute = ({
  isAuthenticated,
  returnPath,
  ...routeProps
}: ProtectedRouteProps) => {
  if (isAuthenticated) {
    return <Route {...routeProps} />;
  }
  showErrorMessage(
    'Insufficient access rights. You have been redirected to the main page.',
    {
      delay: 1500,
    }
  );

  return <Redirect to={returnPath} />;
};

const AsyncContent = React.lazy(
  () => import(/* webpackChunkName: "authorized" */ 'pages/authorized')
);

const Routes: React.FC<{ project: string }> = ({ project }) => {
  return (
    <BrowserRouter basename={project}>
      <React.Suspense fallback={<WhiteLoader />}>
        <PageRoute path="/" component={AsyncContent} />
      </React.Suspense>
    </BrowserRouter>
  );
};

export default Routes;

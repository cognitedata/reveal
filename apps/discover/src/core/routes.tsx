import React from 'react';
import { Route, RouteProps } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import { Location } from 'history';

import { WhiteLoader } from 'components/loading';

type Props = RouteProps & {
  hasSidebar?: boolean;
};

const PageLayout: React.FC<Props> = ({ children }) => <>{children}</>;

export const PageRoute = ({ hasSidebar = true, ...rest }: Props) => {
  return (
    <PageLayout hasSidebar={hasSidebar} location={rest.location as Location}>
      <Route {...rest} />
    </PageLayout>
  );
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

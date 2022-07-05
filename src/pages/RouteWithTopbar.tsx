import * as React from 'react';
import { RouteProps } from 'react-router-dom';
import PageLayout from 'components/Layout/PageLayout';
import ConnectedAppBar from 'containers/AppBar/ConnectedAppBar';
import { SentryRoute } from './Routes';

import 'antd/dist/antd.css';
import '@cognite/cogs.js/dist/cogs.css';

const RouteWithTopbar = ({ component, ...rest }: RouteProps) => {
  const Component = component as React.ComponentClass;
  return (
    <SentryRoute
      {...rest}
      render={(routeProps) => {
        return (
          <PageLayout className="PageLayout">
            <ConnectedAppBar />
            <main>
              <Component {...routeProps} />
            </main>
          </PageLayout>
        );
      }}
    />
  );
};

export default RouteWithTopbar;

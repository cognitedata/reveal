import { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { SDKProvider } from '@cognite/sdk-provider';
import * as Sentry from '@sentry/react';
import { useCluster, useProject } from 'hooks/config';
import Config from 'models/charts/config/classes/Config';
import { CogniteClient } from '@cognite/sdk';
import AuthenticatedRoutes from 'pages/AuthenticatedRoutes';
import TenantSelectorView from './TenantSelector/TenantSelector';

export const SentryRoute = Sentry.withSentryRouting(Route);

const sdk = new CogniteClient({
  appId: `Cognite Charts ${Config.version}`,
});

const Routes = () => {
  const project = useProject();
  const [cluster] = useCluster();
  useEffect(() => {
    if (project) sdk.setProject(project);
    if (cluster) sdk.setBaseUrl(`https://${cluster}.cognitedata.com`);
  }, [project, cluster]);
  return (
    <SDKProvider sdk={sdk}>
      <Switch>
        <SentryRoute path="/" exact component={TenantSelectorView} />
        <SentryRoute path={`/${project}`} component={AuthenticatedRoutes} />
      </Switch>
    </SDKProvider>
  );
};

export default Routes;

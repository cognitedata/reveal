import React, { useEffect, useState } from 'react';
import { getFlow } from '@cognite/auth-utils';
import qs from 'query-string';
import { omit } from 'lodash';
import {
  Route,
  RouteProps,
  Switch,
  useHistory,
  useRouteMatch,
} from 'react-router-dom';
import { Loader } from '@cognite/cogs.js';

import ChartList from 'pages/ChartList';
import ChartView from 'pages/ChartView';
import TenantSelectorView from 'pages/TenantSelector';
import { FileView } from 'pages/FileView';
import TopBar from 'components/TopBar';
import PageLayout from 'components/Layout/PageLayout';
import { getProject, useProject } from 'hooks';
import { useFirebaseInit } from 'hooks/firebase';
import { useSDK } from '@cognite/sdk-provider';
import { getAzureAppId, getSidecar, useCluster } from 'config';

const RouteWithTopbar = ({ component, ...rest }: RouteProps) => {
  const Component = component as React.ComponentClass;
  return (
    <Route
      {...rest}
      render={(routeProps) => {
        return (
          <PageLayout>
            <TopBar />
            <main>
              <Component {...routeProps} />
            </main>
          </PageLayout>
        );
      }}
    />
  );
};

const AppRoutes = () => {
  const { path } = useRouteMatch();
  const history = useHistory();
  const sdk = useSDK();
  const project = useProject();
  const [initializing, setInitializing] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const { isFetched: firebaseDone, isError } = useFirebaseInit(!initializing);

  const foo = getSidecar();
  const [cluster] = useCluster();

  const { flow, options } = getFlow(project, cluster);

  useEffect(() => {
    if (!initializing && authenticated) {
      history.replace({
        ...history.location,
        search: qs.stringify(
          omit(qs.parse(history.location.search), 'id_token', 'access_token')
        ),
      });
    }
  }, [initializing, authenticated, history]);

  useEffect(() => {
    if (project) {
      switch (flow) {
        case 'AZURE_AD': {
          if (!initializing && !authenticated) {
            setInitializing(true);
            sdk
              .loginWithOAuth({
                clientId: getAzureAppId(),
                cluster: cluster || 'api',
                tenantId: options?.directory,
                signInType: {
                  type: 'loginRedirect',
                },
              })
              .then((gotToken) => {
                if (!gotToken) {
                  sdk.authenticate().then((wasAuthenticated) => {
                    setAuthenticated(wasAuthenticated);
                    sdk.setProject(project);
                    setInitializing(false);
                  });
                } else {
                  setAuthenticated(true);
                  sdk.setProject(project);
                  setInitializing(false);
                }
              });
          }
          break;
        }
        case 'COGNITE_AUTH': {
          if (!initializing && !authenticated) {
            setInitializing(true);

            if (cluster) {
              sdk.setBaseUrl(`https://${cluster}.cognitedata.com`);
            }
            sdk
              .loginWithOAuth({
                project,
              })
              .then(() => sdk.authenticate())
              .then((wasAuthenticated) => {
                setAuthenticated(wasAuthenticated);
                setInitializing(false);
              });
          }
          break;
        }
        default: {
          window.location.href = '/';
        }
      }
    }
  }, [
    authenticated,
    cluster,
    flow,
    foo.applicationId,
    initializing,
    options?.directory,
    project,
    sdk,
  ]);

  if (initializing || !firebaseDone) {
    return <Loader />;
  }

  if (isError) {
    return <>nope</>;
  }

  return (
    <Switch>
      <RouteWithTopbar path={`${path}/`} exact component={ChartList} />
      <RouteWithTopbar path={`${path}/:chartId`} exact component={ChartView} />
      <RouteWithTopbar
        path={`${path}/:chartId/files/:assetId`}
        component={FileView}
      />
    </Switch>
  );
};

const Routes = () => {
  const project = getProject();
  return (
    <Switch>
      <Route path="/" exact component={TenantSelectorView} />
      <Route path={`/${project}`}>
        <AppRoutes />
      </Route>
    </Switch>
  );
};

export default Routes;

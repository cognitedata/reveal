import { useEffect, useState } from 'react';
import * as React from 'react';
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
import { Loader, toast } from '@cognite/cogs.js';
import ChartList from 'pages/ChartList/ChartList';
import ChartView from 'pages/ChartView';
import UserProfile from 'pages/UserProfile/UserProfile';
import TenantSelectorView from 'pages/TenantSelector';
import { FileView } from 'pages/FileView/FileView';
import TopBar from 'components/TopBar';
import PageLayout from 'components/Layout/PageLayout';
import { useFirebaseInit } from 'hooks/firebase';
import { useSDK } from '@cognite/sdk-provider';
import { getAzureAppId, getSidecar } from 'config';
import { identifyUser } from 'services/metrics';
import { azureInfo, loginStatus } from 'services/user-info';
import * as Sentry from '@sentry/react';
import { useCluster, useProject } from 'hooks/config';
import ErrorToast from 'components/ErrorToast/ErrorToast';

const SentryRoute = Sentry.withSentryRouting(Route);

const RouteWithTopbar = ({ component, ...rest }: RouteProps) => {
  const Component = component as React.ComponentClass;
  return (
    <SentryRoute
      {...rest}
      render={(routeProps) => {
        return (
          <PageLayout className="PageLayout">
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
  const { isFetched: firebaseDone, isError: isFirebaseError } = useFirebaseInit(
    !initializing && authenticated
  );

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
                  sdk.authenticate().then(async (wasAuthenticated) => {
                    setAuthenticated(wasAuthenticated);
                    sdk.setProject(project);
                    if (wasAuthenticated) {
                      const login = await azureInfo(sdk);
                      identifyUser(login);
                    }
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
              .then(async (wasAuthenticated) => {
                setAuthenticated(wasAuthenticated);
                if (wasAuthenticated) {
                  const login = await loginStatus(sdk);
                  identifyUser(login);
                }
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

  if (isFirebaseError) {
    toast.error(
      <ErrorToast
        title="Failed to load Firebase"
        text="Please reload the page"
      />,
      {
        autoClose: false,
        closeOnClick: false,
      }
    );
    return null;
  }

  return (
    <Switch>
      <RouteWithTopbar path={`${path}/`} exact component={ChartList} />
      <RouteWithTopbar path={`${path}/user`} exact component={UserProfile} />
      <RouteWithTopbar path={`${path}/:chartId`} exact component={ChartView} />
      <RouteWithTopbar
        path={`${path}/:chartId/files/:assetId`}
        component={FileView}
      />
    </Switch>
  );
};

const Routes = () => {
  const project = useProject();

  return (
    <Switch>
      <SentryRoute path="/" exact component={TenantSelectorView} />
      <SentryRoute path={`/${project}`}>
        <AppRoutes />
      </SentryRoute>
    </Switch>
  );
};

export default Routes;

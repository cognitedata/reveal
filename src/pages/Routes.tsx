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
import PageLayout from 'components/Layout/PageLayout';
import { useFirebaseInit } from 'hooks/firebase';
import { useSDK } from '@cognite/sdk-provider';
import { azureInfo, loginStatus } from 'services/user-info';
import * as Sentry from '@sentry/react';
import { useCluster, useProject } from 'hooks/config';
import ErrorToast from 'components/ErrorToast/ErrorToast';
import config from 'config/config';
import mixpanel from 'mixpanel-browser';
import { UserInfo } from 'models/chart/types';
import TopBarWrapper from 'components/TopBar/TopBar';
import TenantSelectorView from './TenantSelector/TenantSelector';
import UserProfile from './UserProfile/UserProfile';
import ChartListPage from './ChartListPage/ChartListPage';
import ChartViewPageRoute from './ChartViewPage/ChartViewPageRoute';

const SentryRoute = Sentry.withSentryRouting(Route);

const RouteWithTopbar = ({ component, ...rest }: RouteProps) => {
  const Component = component as React.ComponentClass;
  return (
    <SentryRoute
      {...rest}
      render={(routeProps) => {
        return (
          <PageLayout className="PageLayout">
            <TopBarWrapper />
            <main>
              <Component {...routeProps} />
            </main>
          </PageLayout>
        );
      }}
    />
  );
};

// This will be moved out of the routes in a next refactor to have the user as a singleton class
const identifyUser = (
  user: UserInfo,
  project: string,
  cluster = 'europe-west1-1',
  azureADTenant?: string
) => {
  if (user) {
    if (config.mixpanelToken) {
      mixpanel.identify(user.email || user.displayName || user.id);
      mixpanel.people.set({ $name: user.displayName, $email: user.email });
      mixpanel.people.union('Projects', project);
      mixpanel.people.union('Clusters', cluster);
      if (azureADTenant)
        mixpanel.people.union('Azure AD Tenants', azureADTenant);
    }
    Sentry.setUser({
      email: user.email,
      id: user.id,
      username: user.displayName,
    });
  }
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
                clientId: config.azureAppId,
                cluster: cluster || 'api',
                tenantId: options?.directory,
                signInType: {
                  type: 'loginRedirect',
                },
              })
              .then(async (gotToken) => {
                if (!gotToken) {
                  const wasAuthenticated = await sdk.authenticate();
                  const azureADToken = await sdk.getAzureADAccessToken();
                  if (azureADToken)
                    localStorage.setItem(
                      '@cognite/charts/azureAdToken',
                      azureADToken
                    );
                  const cdfToken = await sdk.getCDFToken();
                  if (cdfToken)
                    localStorage.setItem('@cognite/charts/cdfToken', cdfToken);
                  setAuthenticated(wasAuthenticated);
                  sdk.setProject(project);
                  if (wasAuthenticated) {
                    const login = await azureInfo(sdk);
                    identifyUser(login, project, cluster, options?.directory);
                  }
                  setInitializing(false);
                } else {
                  const loginInfo = await azureInfo(sdk);
                  identifyUser(loginInfo, project, cluster, options?.directory);
                  setAuthenticated(true);
                  sdk.setProject(project);
                  const azureADToken = await sdk.getAzureADAccessToken();
                  if (azureADToken)
                    localStorage.setItem(
                      '@cognite/charts/azureAdToken',
                      azureADToken
                    );
                  const cdfToken = await sdk.getCDFToken();
                  if (cdfToken)
                    localStorage.setItem('@cognite/charts/cdfToken', cdfToken);
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
                const token = await sdk.getCDFToken();
                if (token)
                  localStorage.setItem('@cognite/charts/cdfToken', token);
                if (wasAuthenticated) {
                  const login = await loginStatus(sdk);
                  identifyUser(login, project, cluster);
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
      <RouteWithTopbar path={`${path}/`} exact component={ChartListPage} />
      <RouteWithTopbar path={`${path}/user`} exact component={UserProfile} />
      <RouteWithTopbar
        path={`${path}/:chartId`}
        component={ChartViewPageRoute}
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

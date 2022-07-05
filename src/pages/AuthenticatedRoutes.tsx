import { Loader } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';
import { useCluster, useProject } from 'hooks/config';
import Login from 'models/charts/login/classes/Login';
import ChartListPage from 'pages/ChartListPage/ChartListPage';
import ChartViewPageRoute from 'pages/ChartViewPage/ChartViewPageRoute';
import RouteWithTopbar from 'pages/RouteWithTopbar';
import UserProfile from 'pages/UserProfile/UserProfile';
import { useCallback, useEffect, useState } from 'react';
import { Redirect, Switch, useHistory, useRouteMatch } from 'react-router-dom';

const AuthenticatedRoutes = () => {
  const match = useRouteMatch();
  const { path } = match;
  const history = useHistory();
  const sdk = useSDK();
  const project = useProject();
  const [cluster] = useCluster();

  const [authError, setAuthError] = useState<string>();
  const [authenticated, setAuthenticated] = useState(false);

  const removeAuthQueryParams = useCallback(() => {
    const searchParams = new URLSearchParams(history.location.search);
    searchParams.delete('id_token');
    searchParams.delete('access_token');
    history.replace({ ...history.location, search: searchParams.toString() });
  }, [history]);

  useEffect(() => {
    if (!project || authenticated) return;
    Login.login(sdk, project, cluster)
      .then(() => {
        removeAuthQueryParams();
        setAuthenticated(true);
      })
      .catch(() => setAuthError('Something failed!'));
  }, [authenticated, cluster, project, removeAuthQueryParams, sdk]);

  if (authError) return <Redirect to="/" />;

  if (!authenticated) {
    return <Loader darkMode={false} infoTitle="Initializing the application" />;
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

export default AuthenticatedRoutes;

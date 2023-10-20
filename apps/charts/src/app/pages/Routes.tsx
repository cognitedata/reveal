import * as React from 'react';
import { Route, Routes as ReactRoutes } from 'react-router-dom';

import * as Sentry from '@sentry/react';

import { getFlow } from '@cognite/auth-utils';
import { getProject, getCluster } from '@cognite/cdf-utilities';
import { useFirebaseInit } from '@cognite/charts-lib';
import { Loader, toast } from '@cognite/cogs.js';
import { parseEnvFromCluster } from '@cognite/login-utils';

import ErrorToast from '../components/ErrorToast/ErrorToast';
import PageLayout from '../components/Layout/PageLayout';
import SecondaryTopBar from '../components/SecondaryTopBar/SecondaryTopBar';
import { useUserInfo } from '../hooks/useUserInfo';
import { identifyUserForMetrics } from '../services/metrics';

import ChartListPage from './ChartListPage/ChartListPage';
import ChartViewPage from './ChartViewPage/ChartViewPage';
import FileViewPage from './FileViewPage/FileViewPage';
import { UnsubscribePage } from './UnsubscribePage/UnsubscribePage';

type PropsRouteWithFirebase = {
  element: () => JSX.Element;
  enableSecondaryNavBar?: boolean;
};
const RouteWithFirebase = ({
  element,
  enableSecondaryNavBar,
}: PropsRouteWithFirebase): JSX.Element => {
  const { isFetched: firebaseDone, isError: isFirebaseError } =
    useFirebaseInit(true);
  const project = getProject();
  const cluster = getCluster();
  const env = parseEnvFromCluster(cluster as string);
  const { options } = getFlow(project, env);
  const { data: user } = useUserInfo();
  const Component = element;

  React.useEffect(() => {
    // options.directory tells if it is AAD tenant
    identifyUserForMetrics(
      user,
      project,
      cluster as string,
      options?.directory
    );
  }, [project, cluster, user]);

  if (!firebaseDone) {
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
    return <></>;
  }
  return (
    <PageLayout className="PageLayout">
      {enableSecondaryNavBar ? <SecondaryTopBar /> : null}
      <main>
        <Component />
      </main>
    </PageLayout>
  );
};

const RouteWithSentry = Sentry.withSentryReactRouterV6Routing(Route);

const Routes = () => {
  const baseUrl = '/:project/:subAppPath';
  return (
    <ReactRoutes>
      <RouteWithSentry
        path={`${baseUrl}`}
        element={<RouteWithFirebase element={ChartListPage} />}
      />
      <RouteWithSentry
        path={`${baseUrl}/unsubscribe/monitoring/:channelId`}
        element={<RouteWithFirebase element={UnsubscribePage} />}
      />
      <RouteWithSentry
        path={`${baseUrl}/:chartId`}
        element={
          <RouteWithFirebase element={ChartViewPage} enableSecondaryNavBar />
        }
      />
      <RouteWithSentry
        path={`${baseUrl}/:chartId/files/:assetId`}
        element={<RouteWithFirebase element={FileViewPage} />}
      />
    </ReactRoutes>
  );
};

export default Routes;
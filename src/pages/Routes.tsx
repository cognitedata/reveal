import * as React from 'react';
import { Route, Routes as ReactRoutes } from 'react-router-dom';
import { Loader, toast } from '@cognite/cogs.js';
import PageLayout from 'components/Layout/PageLayout';
import { useFirebaseInit } from 'hooks/firebase';
import * as Sentry from '@sentry/react';
import ErrorToast from 'components/ErrorToast/ErrorToast';
import ConnectedAppBar from 'components/AppBar/ConnectedAppBar';
import config from 'config/config';
import TenantSelectorView from './TenantSelector/TenantSelector';
import UserProfile from './UserProfile/UserProfile';
import ChartListPage from './ChartListPage/ChartListPage';
import ChartViewPage from './ChartViewPage/ChartViewPage';
import FileViewPage from './FileViewPage/FileViewPage';

/**
 * Fusion and Legacy Charts have slightly different paths.
 * Fusion includes :subAppPath because it needs to be aware which subapp is active.
 * Legacy Charts is only Charts so it does not have this param.
 */
const getPath = (basePath: string = '') => {
  const { isFusion } = config;
  const newPath = isFusion
    ? `/:project/:subAppPath/${basePath}`
    : `/:project/${basePath}`;
  return newPath;
};

type PropsRouteWithFirebase = {
  element: () => JSX.Element;
};
const RouteWithFirebase = ({
  element,
}: PropsRouteWithFirebase): JSX.Element => {
  const { isFetched: firebaseDone, isError: isFirebaseError } =
    useFirebaseInit(true);
  const Component = element;

  if (!firebaseDone) {
    return <Loader />;
  }

  if (isFirebaseError) {
    // TODO(DEGR-902): toast is not properly styled
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
      {!config.isFusion && <ConnectedAppBar />}
      <main>
        <Component />
      </main>
    </PageLayout>
  );
};

const RouteWithSentry = Sentry.withSentryReactRouterV6Routing(Route);

const Routes = () => {
  return (
    <ReactRoutes>
      <RouteWithSentry path="/" element={<TenantSelectorView />} />
      <RouteWithSentry
        path={getPath()}
        element={<RouteWithFirebase element={ChartListPage} />}
      />
      <RouteWithSentry
        path={getPath('user')}
        element={<RouteWithFirebase element={UserProfile} />}
      />
      <RouteWithSentry
        path={getPath(':chartId')}
        element={<RouteWithFirebase element={ChartViewPage} />}
      />
      <RouteWithSentry
        path={getPath(':chartId/files/:assetId')}
        element={<RouteWithFirebase element={FileViewPage} />}
      />
    </ReactRoutes>
  );
};

export default Routes;

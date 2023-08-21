import React, { Suspense } from 'react';
import { Route, useParams } from 'react-router-dom';
// eslint-disable-next-line @nx/enforce-module-boundaries
import LandingPage from '@fusion-shell/app/components/LandingPage';
// eslint-disable-next-line
import {
  getAppManifest,
  getModuleFederationApps,
} from '@fusion-shell/app/utils/sub-apps-utils';

import { loadRemoteModule } from '@fusion/load-remote-module';
import { isUsingUnifiedSignin } from '@cognite/cdf-utilities';

const appManifest = getAppManifest();

type SubAppPathElementProps = {
  isReleaseBanner: string;
};

const SubAppPathElement = ({ isReleaseBanner }: SubAppPathElementProps) => {
  const { subAppPath } = useParams<{ subAppPath: string }>();
  if (!subAppPath) {
    return <LandingPage isReleaseBanner={isReleaseBanner} />;
  }

  return (
    <Suspense fallback={<div>loading app...</div>}>
      {/* <SubApp useInShell /> */}
      <div></div>
    </Suspense>
  );
};

const createDynamicRoutes = () => {
  return Object.keys(getModuleFederationApps()).map((appKey) => {
    const DynamicComponent = React.lazy(() =>
      loadRemoteModule(appKey, './Module')
    );

    const appConfig = appManifest.apps.find((app) => app.key === appKey);
    const appRoutes = appConfig?.routes.filter((routeItem) =>
      isUsingUnifiedSignin()
        ? routeItem.route.startsWith('/:applicationName')
        : !routeItem.route.startsWith('/:applicationName')
    );

    return (
      <Route
        key={appKey}
        path={`${appRoutes![0].route}/*`}
        element={<DynamicComponent key={appKey} />}
      />
    );
  });
};

const dynamicRoutes = createDynamicRoutes();

export const DynamicRoutes = (
  routerBasename: string,
  isReleaseBanner: string
) => (
  <>
    {dynamicRoutes}
    <Route
      path={`${routerBasename}/:subAppPath/*`}
      element={<SubAppPathElement isReleaseBanner={isReleaseBanner} />}
    />
  </>
);

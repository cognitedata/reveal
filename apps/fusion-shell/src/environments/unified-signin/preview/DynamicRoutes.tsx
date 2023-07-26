import React, { Suspense } from 'react';
import { Route, useParams } from 'react-router-dom';
// eslint-disable-next-line @nx/enforce-module-boundaries
import LandingPage from '@fusion-shell/app/components/LandingPage';
import { loadRemoteModule } from '@fusion/load-remote-module';

const Platypus = React.lazy(() => loadRemoteModule('platypus', './Module'));

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

export const DynamicRoutes = (
  routerBasename: string,
  isReleaseBanner: string
) => (
  <>
    <Route path={`${routerBasename}/data-models/*`} element={<Platypus />} />
    <Route
      path={`${routerBasename}/:subAppPath/*`}
      element={<SubAppPathElement isReleaseBanner={isReleaseBanner} />}
    />
  </>
);

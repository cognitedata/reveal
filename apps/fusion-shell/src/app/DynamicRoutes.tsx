import { Suspense } from 'react';
import { Route, useParams } from 'react-router-dom';

import LandingPage from './components/LandingPage';

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
  <Route
    path={`${routerBasename}/:subAppPath/*`}
    element={<SubAppPathElement isReleaseBanner={isReleaseBanner} />}
  />
);

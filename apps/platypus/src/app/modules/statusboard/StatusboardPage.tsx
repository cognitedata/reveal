import { lazy, Suspense } from 'react';

import { NavigationMain } from '@platypus-app/components/Navigations/NavigationMain';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';

const Status = lazy(() =>
  import('./Statusboard').then((module) => ({
    default: module.Status,
  }))
);

export const StatusPage = () => (
  <>
    <NavigationMain />
    <Suspense fallback={<Spinner />}>
      <Status />
    </Suspense>
  </>
);

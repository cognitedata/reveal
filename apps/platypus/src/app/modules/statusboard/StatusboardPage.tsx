import { lazy, Suspense } from 'react';

import { Spinner } from '@platypus-app/components/Spinner/Spinner';

const Status = lazy(() =>
  import('./Statusboard').then((module) => ({
    default: module.Status,
  }))
);

export const StatusPage = () => (
  <>
    <Suspense fallback={<Spinner />}>
      <Status />
    </Suspense>
  </>
);

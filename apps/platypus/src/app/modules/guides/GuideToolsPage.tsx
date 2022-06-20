import { lazy, Suspense } from 'react';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';

const GuideTools = lazy(() =>
  import('./GuideTools').then((module) => ({
    default: module.GuideTools,
  }))
);

export const GuideToolsPage = () => (
  <>
    <Suspense fallback={<Spinner />}>
      <GuideTools />
    </Suspense>
  </>
);

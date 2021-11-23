import { lazy, Suspense } from 'react';
import { NavigationMain } from '@platypus-app/components/Navigations/NavigationMain';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';

const GuideTools = lazy(() =>
  import('./GuideTools').then((module) => ({
    default: module.GuideTools,
  }))
);

export const GuideToolsPage = () => (
  <>
    <NavigationMain />
    <Suspense fallback={<Spinner />}>
      <GuideTools />
    </Suspense>
  </>
);

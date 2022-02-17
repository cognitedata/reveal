import React, { ComponentType, lazy, ReactNode, Suspense } from 'react';

import Spinner from 'components/Spinner';

export function LazyWrapper<P>(
  props: P,
  importFn: () => Promise<{ default: ComponentType<any> }>,
  loadingComponent: ReactNode = <Spinner size="large" />
) {
  const LazyComp = lazy(importFn);
  return (
    <Suspense fallback={loadingComponent}>
      <LazyComp {...props} />
    </Suspense>
  );
}

import React, { ComponentType, lazy, ReactNode, Suspense } from 'react';

export function LazyWrapper<P>(
  props: P,
  importFn: () => Promise<{ default: ComponentType<any> }>,
  loadingComponent: ReactNode = <div>Loading...</div>
) {
  const LazyComp = lazy(importFn);
  return (
    <Suspense fallback={loadingComponent}>
      <LazyComp {...props} />
    </Suspense>
  );
}

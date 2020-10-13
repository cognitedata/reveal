import React, { ComponentType, lazy, ReactNode, Suspense } from 'react';

import Spin from 'antd/lib/spin';

export function LazyWrapper<P>(
  props: P,
  importFn: () => Promise<{ default: ComponentType<any> }>,
  loadingComponent: ReactNode = <Spin size="large" />
) {
  const LazyComp = lazy(importFn);
  return (
    <Suspense fallback={loadingComponent}>
      <LazyComp {...props} />
    </Suspense>
  );
}

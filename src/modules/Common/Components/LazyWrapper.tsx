import { Loader } from '@cognite/cogs.js';
import React, { ComponentType, lazy, Suspense, useMemo } from 'react';

export function LazyWrapper(props: {
  importFn: () => Promise<{ default: ComponentType<any> }>;
}) {
  const LazyComp = useMemo(() => lazy(props.importFn), [props.importFn]);

  return (
    <Suspense fallback={<Loader />}>
      <LazyComp />
    </Suspense>
  );
}

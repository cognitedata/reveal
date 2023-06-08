import React, { LazyExoticComponent, ReactNode, Suspense } from 'react';

import Spinner from '@3d-management/components/Spinner';

export const FallbackWrapper = <P,>(
  Component:
    | ((props?: P) => JSX.Element)
    | LazyExoticComponent<(props?: any) => JSX.Element>,
  props?: P,
  loadingComponent: ReactNode = <Spinner size="large" />
) => (
  <Suspense fallback={loadingComponent}>
    <Component {...props} />
  </Suspense>
);

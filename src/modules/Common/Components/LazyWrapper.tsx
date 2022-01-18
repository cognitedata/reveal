import { Loader } from '@cognite/cogs.js';
import React, {
  ComponentType,
  lazy,
  ReactNode,
  Suspense,
  useMemo,
} from 'react';

export function LazyWrapper<P>(props: {
  routeProps: P;
  importFn: () => Promise<{ default: ComponentType<any> }>;
  loadingComponent?: ReactNode;
}) {
  const loader = props.loadingComponent || <Loader />;
  const LazyComp = useMemo(() => lazy(props.importFn), [props.importFn]);

  return (
    <Suspense fallback={loader}>
      <LazyComp {...props.routeProps} />
    </Suspense>
  );
}

/*
 * Copyright 2020 Cognite AS
 */

import React, { ComponentType, Suspense } from 'react';
import WithBasePath from './WithBasePath';

// Demos imported lazily because of docusaurus SSR. Every demo has dependency on reveal which assumes browser context, not nodejs.
// So every component with client-side code must be loaded in lazy mode, to avoid execution during SSR
const components: Record<string, ComponentType<any>> = {
  Cognite3DViewerDemo: React.lazy(() => import('../../docs/examples/Cognite3DViewerDemo'))
};

export default function DemoWrapper({ name }: { name: string }) {
  if (typeof window === 'undefined') {
    return <div />
  }
  let LazyComponent = components[name];
  return (
    <Suspense fallback={<div>Loading demo...</div>}>
      <WithBasePath />
      <LazyComponent />
    </Suspense>
  );
}

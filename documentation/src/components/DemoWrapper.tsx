/*
 * Copyright 2020 Cognite AS
 */

import React, { ComponentType, Suspense } from 'react';
import WithBasePath from './WithBasePath';

type DemoNames = 'Cognite3DViewerExampleDemo'

// Demos imported lazily because of docusaurus SSR. Every demo has dependency on reveal which assumes browser context, not nodejs.
// So every component with client-side code must be loaded in lazy mode, to avoid execution during SSR
const components: Record<DemoNames, ComponentType<any>> = {
  Cognite3DViewerExampleDemo: React.lazy(() => import('./demos/Cognite3DViewerExampleDemo'))
};

export default function DemoWrapper({ name }: { name: DemoNames }) {
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

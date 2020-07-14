/*
 * Copyright 2020 Cognite AS
 */

import React, { ComponentType, Suspense } from 'react';
import WithBasePath from './WithBasePath';
import styled from 'styled-components';
import { DemoProps } from './DemoProps';
import { CogniteClient } from '@cognite/sdk';
import { DemoLoginCover } from './DemoLoginCover';

const DemoContainer = styled.div`
  height: calc(min(85vh, 600px));
  display: flex;
  flex-direction: column;
`;

// Demos imported lazily because of docusaurus SSR. Every demo has dependency on reveal which assumes browser context, not nodejs.
// So every component with client-side code must be loaded in lazy mode, to avoid execution during SSR
const components: Record<string, ComponentType<DemoProps>> = {
  Cognite3DViewerDemo: React.lazy(() =>
    import('../../docs/examples/Cognite3DViewerDemo')
  ),
};

export function DemoWrapper({ name }: { name: string }) {
  if (typeof window === 'undefined') {
    return <div />;
  }
  let LazyComponent = components[name];
  return (
    <DemoContainer>
      <Suspense fallback={<div>Loading demo...</div>}>
        <WithBasePath />
        <DemoLoginCover>
          {(client: CogniteClient) => <LazyComponent client={client} />}
        </DemoLoginCover>
      </Suspense>
    </DemoContainer>
  );
}

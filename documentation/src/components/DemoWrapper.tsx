/*
 * Copyright 2020 Cognite AS
 */

import React, { ComponentType, Suspense } from 'react';
import styled from 'styled-components';
import { DemoProps } from './DemoProps';
import { CogniteClient } from '@cognite/sdk';
import { env } from '@site/src/env';

const DemoContainer = styled.div`
  height: calc(min(85vh, 600px));
  display: flex;
  flex-direction: column;
  margin-bottom: var(--ifm-leading);
`;

// any component that has client-side only code couldn't be imported directly (it fails SSR)
const DemoLoginCover = React.lazy(() => import('./DemoLoginCover'));

const components: Record<string, ComponentType<DemoProps>> = {
  Cognite3DViewerDemo: React.lazy(() =>
    import('@site/docs/demos/Cognite3DViewerDemo')
  ),
  ModelPreviewDemo: React.lazy(() =>
    import('@site/docs/demos/ModelPreviewDemo')
  ),
};

// demo wrapper just wraps the demo. don't pass modelId/revisionId to it, they defined in demos
// different demos might have different ids, e.g. pointcloud/cad
// also we can use 3ddemo instead of publicdata so here is .env file to help with it
export function DemoWrapper({
  name,
  model,
  modelType,
  ...rest
}: {
  name: string;
  model?: { id: number; revisionId: number };
  modelType?: string;
  [key: string]: any; // any other props that might be bypassed to specific Demo
}) {
  if (typeof window === 'undefined') {
    return <div />;
  }
  let LazyComponent = components[name];
  if (!LazyComponent) {
    throw new Error(`Demo component with the name "${name}" is not found.`);
  }

  let ids = model || modelType === 'pointcloud' ? env.pointCloud : env.cad;

  return (
    <DemoContainer id="demo-wrapper">
      <Suspense fallback={<div>Loading demo...</div>}>
        <DemoLoginCover>
          {(client: CogniteClient) => (
            <LazyComponent
              client={client}
              {...rest}
              modelId={ids.modelId}
              revisionId={ids.revisionId}
            />
          )}
        </DemoLoginCover>
      </Suspense>
    </DemoContainer>
  );
}

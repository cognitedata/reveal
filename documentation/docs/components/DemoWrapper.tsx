/*
 * Copyright 2021 Cognite AS
 */

import React, { ComponentType, Suspense } from 'react';
import styled from 'styled-components';
import { DemoProps } from './DemoProps';
import { CogniteClient } from '@cognite/sdk';
import { env } from '@site/docs/utils/env';

const DemoContainer = styled.div`
  height: calc(min(85vh, 600px));
  display: flex;
  flex-direction: column;
  margin-bottom: var(--ifm-leading);
`;

// any component that has client-side only code couldn't be imported directly (it fails SSR)
const DemoLoginCover = React.lazy(() => import('./DemoLoginCover'));

const ViewerComponent: ComponentType<DemoProps> = React.lazy(() =>
  import('./Cognite3DViewerDemo')
);

// demo wrapper just wraps the demo. don't pass modelId/revisionId to it, they defined in demos
// different demos might have different ids, e.g. pointcloud/cad
// also we can use 3ddemo instead of publicdata so here is .env file to help with it
export function DemoWrapper({
  ids,
  modelType,
  ...rest
}: {
  ids?: { modelId: number; revisionId: number };
  modelType?: string;
  [key: string]: any; // any other props that might be bypassed to specific Demo
}) {
  if (typeof window === 'undefined') {
    return <div />;
  }

  let modelAndRevisionIds =
    ids || (modelType === 'pointcloud' ? env.pointCloud : env.cad);

  return (
    <div>
      <DemoContainer id="demo-wrapper">
        <Suspense fallback={<div>Loading demo...</div>}>
          <DemoLoginCover>
            {(client: CogniteClient) => (
              <ViewerComponent
                client={client}
                {...rest}
                modelId={modelAndRevisionIds.modelId}
                revisionId={modelAndRevisionIds.revisionId}
              />
            )}
          </DemoLoginCover>
        </Suspense>
      </DemoContainer>
    </div>
  );
}

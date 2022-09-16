/*
 * Copyright 2021 Cognite AS
 */

import React, { Suspense } from 'react';
import styled from 'styled-components';
import { DemoLoginCover } from './DemoLoginCover';
import { CogniteClient } from '@cognite/sdk';
import { Cognite3DViewerDemo } from './Cognite3DViewerDemo';
import { env } from '@site/docs/utils/env';

const DemoContainer = styled.div`
  height: calc(min(85vh, 600px));
  display: flex;
  flex-direction: column;
  margin-bottom: var(--ifm-leading);
`;

// demo wrapper just wraps the demo. don't pass modelId/revisionId to it, they defined in demos
// different demos might have different ids, e.g. pointcloud/cad
// also we can use 3ddemo instead of publicdata so here is .env file to help with it
export function DemoWrapper({
  name,
  ids,
  modelType,
  ...rest
}: {
  name: string;
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
              <Cognite3DViewerDemo
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

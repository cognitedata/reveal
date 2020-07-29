/*
 * Copyright 2020 Cognite AS
 */

import React, { ComponentType, Suspense } from 'react';
import styled from 'styled-components';
import { DemoProps } from './DemoProps';
import { CogniteClient } from '@cognite/sdk';
import { useBaseTag } from '../hooks/useBaseTag';

const DemoContainer = styled.div`
  height: calc(min(85vh, 600px));
  display: flex;
  flex-direction: column;
`;

// any component that has client-side only code couldn't be imported directly (it fails SSR)
const DemoLoginCover = React.lazy(() => import('./DemoLoginCover'));

const components: Record<string, ComponentType<DemoProps>> = {
  Cognite3DViewerDemo: React.lazy(() =>
    import('../../docs/examples/Cognite3DViewerDemo')
  ),
};

export function DemoWrapper({ name }: { name: string }) {
  useBaseTag('[data-basetagnail]');

  if (typeof window === 'undefined') {
    return <div />;
  }
  let LazyComponent = components[name];
  return (
    <DemoContainer data-basetagnail>
      <Suspense fallback={<div>Loading demo...</div>}>
        <DemoLoginCover>
          {(client: CogniteClient) => <LazyComponent client={client} />}
        </DemoLoginCover>
      </Suspense>
    </DemoContainer>
  );
}

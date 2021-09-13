/*!
 * Copyright 2021 Cognite AS
 */

import React from 'react';

import { Cognite3DTestViewer } from '../Cognite3DTestViewer';

export function DefaultCognite3DViewerTestPage() {
  const modelUrl = 'primitives';
  
  return <Cognite3DTestViewer modelUrl={modelUrl} />;
}

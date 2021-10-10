/*!
 * Copyright 2021 Cognite AS
 */

import React from 'react';
import { registerVisualTest } from '../../../visual_tests';

import { Cognite3DTestViewer } from '../Cognite3DTestViewer';

function DefaultCognite3DViewerTestPage() {
  const modelUrl = 'primitives';
  
  return <Cognite3DTestViewer modelUrls={[modelUrl]} />;
}

registerVisualTest('cad', 'default-cognite3dviewer', 'Default Cognite3DViewer', <DefaultCognite3DViewerTestPage />)

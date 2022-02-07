/*!
 * Copyright 2021 Cognite AS
 */

import React from 'react';
import { registerVisualTest } from '../../../visual_tests';

import { Cognite3DTestViewer } from '../Cognite3DTestViewer';

function DefaultCognite3DViewerTestPageV8() {
  const modelUrl = 'primitives_v8';

  return <Cognite3DTestViewer modelUrls={[modelUrl]} />;
}

registerVisualTest('cad', 'default-cognite3dviewer-v8', 'Default Cognite3DViewer V8', <DefaultCognite3DViewerTestPageV8 />)

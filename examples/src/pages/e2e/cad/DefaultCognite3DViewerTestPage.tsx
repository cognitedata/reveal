/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DViewer } from '@cognite/reveal';
import React from 'react';
import { THREE } from '@cognite/reveal';
import { registerVisualTest } from '../../../visual_tests';

import { Cognite3DTestViewer } from '../Cognite3DTestViewer';

function DefaultCognite3DViewerTestPage() {
  const modelUrl = 'primitives';
  
  return <Cognite3DTestViewer modelUrls={[modelUrl]} initializeCallback={(viewer:Cognite3DViewer) => {
    // Sanity check for pixel ratio. It should not impact the resolution in any way
    viewer.renderer.setPixelRatio(4);

    viewer.cameraManager.setCameraState({position: new THREE.Vector3(30,10,50), 
      target: new THREE.Vector3()});
  }}/>;
}

registerVisualTest('cad', 'default-cognite3dviewer', 'Default Cognite3DViewer', <DefaultCognite3DViewerTestPage />)

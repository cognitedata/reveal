/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DViewer } from '@cognite/reveal';
import * as THREE from 'three';
import { registerVisualTest } from '../../../visual_tests';
import { Cognite3DTestViewer } from '../Cognite3DTestViewer';

/**
 * Test verifies that transparent custom objects are blended correctly with model when viewer background color
 * is overridden.
 */
function CustomBackgroundColorAndFXAA() {
  const modelUrl = 'primitives';
  
  function initializeViewer(viewer: Cognite3DViewer) {
    viewer.setBackgroundColor(new THREE.Color('pink'));
  }

  return <Cognite3DTestViewer 
    modelUrls={[modelUrl]} 
    initializeCallback={initializeViewer} 
    viewerOptions={{antiAliasingHint: 'fxaa'}}
  />;
}

registerVisualTest('cad', 'customBackgroundColorAndFXAA', 'Background color works when FXAA is enabled', <CustomBackgroundColorAndFXAA />)

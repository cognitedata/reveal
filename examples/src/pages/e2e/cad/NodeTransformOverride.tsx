/*!
 * Copyright 2021 Cognite AS
 */

import { Cognite3DModel, Cognite3DViewer, THREE } from '@cognite/reveal';
import React from 'react';
import { registerVisualTest } from '../../../visual_tests';
import { Cognite3DTestViewer } from '../Cognite3DTestViewer';

function NodeTransformOverridePage() {
  const modelUrl = 'primitives';

  return <Cognite3DTestViewer modelUrls={[modelUrl]} initializeCallback={(viewer: Cognite3DViewer) => {
    viewer.cameraManager.setCameraState({
      position: new THREE.Vector3(30, 10, 50),
      target: new THREE.Vector3()
    });
  }} cadModelAddedCallback={(model: Cognite3DModel) => {
    const scale = new THREE.Matrix4().makeScale(3, 3, 3);
    const rotation = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
    const translation = new THREE.Matrix4().makeTranslation(12, 10, -12);

    const transform = translation.multiply(rotation.multiply(scale));
    model.setNodeTransformByTreeIndex(1, transform, false);

    for (let i = 2; i < 80; i++) {
      model.setNodeTransformByTreeIndex(i, new THREE.Matrix4().makeTranslation(0, ((i % 2) * 2 - 1) * 2, 0), false);
    }
  }} />;
}

registerVisualTest('cad', 'nodeTransform', 'Override Node Transform', <NodeTransformOverridePage />)

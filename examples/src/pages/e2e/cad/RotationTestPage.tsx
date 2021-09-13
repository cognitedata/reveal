/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import React from 'react';
import { TestEnvCad, TestViewer } from '../TestViewer';
import { registerVisualTest } from '../../../visual_tests';

function RotationTestPage() {
  return (
    <TestViewer
      modifyTestEnv={({ model }: TestEnvCad) => {
        const matrix = model.getModelTransformation();
        const newMatrix = new THREE.Matrix4().multiplyMatrices(
          matrix,
          new THREE.Matrix4().makeRotationY(Math.PI / 3.0)
        );
        model.setModelTransformation(newMatrix);

        return {
          cameraConfig: model.suggestCameraConfig(),
        };
      }}
    />
  );
}

registerVisualTest('cad', 'rotateCadModel', 'Rotate model', <RotationTestPage />)

/*!
 * Copyright 2021 Cognite AS
 */

import { THREE } from '@cognite/reveal';
import React from 'react';
import { TestEnvCad, TestViewer } from '../TestViewer';
import { registerVisualTest } from '../../../visual_tests';

function ScaledModelTestPage() {
  return (
    <TestViewer
      modifyTestEnv={({ model }: TestEnvCad) => {
        const matrix = model.getModelTransformation();
        const newMatrix = matrix.scale(new THREE.Vector3(5, 5, 5));
        model.setModelTransformation(newMatrix);
      }}
    />
  );
}

registerVisualTest('cad', 'scaledModel', 'Scale model', <ScaledModelTestPage />)

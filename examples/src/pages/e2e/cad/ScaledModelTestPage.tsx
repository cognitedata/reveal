/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import React from 'react';
import { TestEnvCad, TestViewer } from '../TestViewer';

export function ScaledModelTestPage() {
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

/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import React from 'react';
import { TestViewer } from '../TestViewer';

export function DefaultPointCloudTestPage() {
  return (
    <TestViewer
      modelName="pointcloud-bunny"
      modelType="pointcloud"
      modifyTestEnv={({ model, scene }) => {
        const bbox: THREE.Box3 = model.getBoundingBox();
        const bboxHelper = new THREE.Box3Helper(bbox);
        scene.add(bboxHelper);
      }}
    />
  );
}

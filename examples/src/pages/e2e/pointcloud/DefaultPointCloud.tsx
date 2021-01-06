/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import CameraControls from 'camera-controls';
import React from 'react';
import { Viewer } from '../Viewer';

CameraControls.install({ THREE });

/*

modelUrl: 'pointcloud-bunny',
modelType: 'pointcloud'

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);

const bbox: THREE.Box3 = model.getBoundingBox();
const bboxHelper = new THREE.Box3Helper(bbox);
scene.add(bboxHelper);

const camTarget = bbox.getCenter(new THREE.Vector3());
const minToCenter = new THREE.Vector3().subVectors(camTarget, bbox.min);
const camPos = camTarget.clone().addScaledVector(minToCenter, -1.5);

*/

export function DefaultPointCloudTestPage() {
  return (
    <Viewer
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

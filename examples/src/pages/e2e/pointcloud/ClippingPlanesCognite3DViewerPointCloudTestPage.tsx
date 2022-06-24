/*!
 * Copyright 2021 Cognite AS
 */

import React from 'react';
import { registerVisualTest } from '../../../visual_tests';

import { PotreePointColorType } from '@cognite/reveal';
import { Cognite3DTestViewer } from '../Cognite3DTestViewer';

import * as THREE from 'three';

function ClippingPlanesCognite3DViewerPointCloudTestPage() {
  const modelUrl = 'pointcloud-bunny';

  return <Cognite3DTestViewer modelUrls={[modelUrl]} pointCloudModelAddedCallback={(model) => {
    model.pointColorType = PotreePointColorType.Height;
  }}
  initializeCallback={(viewer) => { viewer.setClippingPlanes([new THREE.Plane().setFromNormalAndCoplanarPoint(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0))]); } }/>;
}

registerVisualTest('pointcloud', 'clipping-planes-cognite3dviewer-pointcloud', 'Clipping Planes PointCloud', <ClippingPlanesCognite3DViewerPointCloudTestPage />)

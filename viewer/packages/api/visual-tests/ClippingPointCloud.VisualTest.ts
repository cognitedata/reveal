/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { CognitePointCloudModel, PotreePointColorType } from '@reveal/pointclouds';
import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';

// Sanity test for loading point cloud model
export default class ClippingPointCloudVisualTest extends ViewerVisualTestFixture {
  constructor() {
    super('pointcloud-bunny');
  }
  public setup(testFixtureComponents: ViewerTestFixtureComponents): Promise<void> {
    const { models, viewer } = testFixtureComponents;

    const model = models[0];

    if (!(model instanceof CognitePointCloudModel)) {
      return Promise.resolve();
    }

    viewer.setClippingPlanes([
      new THREE.Plane().setFromNormalAndCoplanarPoint(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0))
    ]);

    model.pointColorType = PotreePointColorType.Height;
    return Promise.resolve();
  }
}

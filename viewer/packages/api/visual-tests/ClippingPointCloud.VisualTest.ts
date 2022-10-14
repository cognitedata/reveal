/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { CognitePointCloudModel } from '@reveal/pointclouds';
import { PointColorType } from '@reveal/rendering';
import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';

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

    model.pointColorType = PointColorType.Height;
    return Promise.resolve();
  }
}

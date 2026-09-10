/*!
 * Copyright 2022 Cognite AS
 */
import { Plane, Vector3 } from 'three';

import { CognitePointCloudModel } from '@reveal/pointclouds';
import { PointColorType } from '@reveal/rendering';
import type { ViewerTestFixtureComponents } from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';
import { ViewerVisualTestFixture } from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';

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

    viewer.setGlobalClippingPlanes([
      new Plane().setFromNormalAndCoplanarPoint(new Vector3(1, 0, 0), new Vector3(0, 0, 0))
    ]);

    model.pointColorType = PointColorType.Height;
    return Promise.resolve();
  }
}

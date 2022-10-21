/*!
 * Copyright 2022 Cognite AS
 */

import { CognitePointCloudModel } from '@reveal/pointclouds';
import { PointColorType } from '@reveal/rendering';
import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';

// Sanity test for loading point cloud model
export default class DefaultPointCloudVisualTest extends ViewerVisualTestFixture {
  constructor() {
    super('pointcloud-bunny');
  }
  public setup(testFixtureComponents: ViewerTestFixtureComponents): Promise<void> {
    const { models } = testFixtureComponents;

    const model = models[0];

    if (!(model instanceof CognitePointCloudModel)) {
      return Promise.resolve();
    }

    model.pointColorType = PointColorType.Height;
    return Promise.resolve();
  }
}

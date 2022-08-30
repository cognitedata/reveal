/*!
 * Copyright 2022 Cognite AS
 */

import { CognitePointCloudModel, PotreePointColorType } from '@reveal/pointclouds';
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

    model.pointColorType = PotreePointColorType.Height;
    return Promise.resolve();
  }
}

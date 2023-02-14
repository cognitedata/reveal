/*!
 * Copyright 2022 Cognite AS
 */

import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';

// Sanity test for loading point cloud model
export default class DefaultTexturedVisualTest extends ViewerVisualTestFixture {
  constructor() {
    super('textured');
  }

  public setup(_: ViewerTestFixtureComponents): Promise<void> {
    return Promise.resolve();
  }
}

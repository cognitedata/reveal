/*!
 * Copyright 2022 Cognite AS
 */

import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';

// Sanity test for loading model
export default class DefaultVisualTest extends ViewerVisualTestFixture {
  public setup(_: ViewerTestFixtureComponents): Promise<void> {
    return Promise.resolve();
  }
}

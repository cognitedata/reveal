/*!
 * Copyright 2022 Cognite AS
 */

import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';

// Sanity test for loading v8 model
export default class DefaultV8VisualTest extends ViewerVisualTestFixture {
  constructor() {
    super('primitives_v8');
  }
  public setup(_: ViewerTestFixtureComponents): Promise<void> {
    return Promise.resolve();
  }
}

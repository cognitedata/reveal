/*!
 * Copyright 2022 Cognite AS
 */

import { ViewerVisualTestFixture } from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';

// Sanity test for loading model
export default class DefaultV8VisualTest extends ViewerVisualTestFixture {
  constructor() {
    super('primitives_v8');
  }
  public setup(): Promise<void> {
    return Promise.resolve();
  }
}

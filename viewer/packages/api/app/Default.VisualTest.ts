/*!
 * Copyright 2022 Cognite AS
 */

import { ViewerVisualTestFixture } from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';

// Sanity test for loading model
export default class DefaultVisualTest extends ViewerVisualTestFixture {
  public setup(): Promise<void> {
    return Promise.resolve();
  }
}

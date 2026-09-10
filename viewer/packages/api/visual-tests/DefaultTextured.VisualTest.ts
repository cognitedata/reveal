/*!
 * Copyright 2022 Cognite AS
 */

import type { ViewerTestFixtureComponents } from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';
import { ViewerVisualTestFixture } from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';

export default class DefaultTexturedVisualTest extends ViewerVisualTestFixture {
  constructor() {
    super('textured');
  }

  public setup(_: ViewerTestFixtureComponents): Promise<void> {
    return Promise.resolve();
  }
}

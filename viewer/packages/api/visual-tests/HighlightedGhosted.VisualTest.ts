/*!
 * Copyright 2022 Cognite AS
 */

import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@reveal/cad-styling';
import { Cognite3DModel } from '..';
import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';

export default class HighlightWithDefaultGhostingTestPage extends ViewerVisualTestFixture {
  public setup(testFixtureComponents: ViewerTestFixtureComponents): Promise<void> {
    const { model } = testFixtureComponents;

    if (model instanceof Cognite3DModel) {
      model.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);
      const nodes = new TreeIndexNodeCollection([...Array(15).keys()]);
      model.assignStyledNodeCollection(nodes, DefaultNodeAppearance.Highlighted);
    }

    return Promise.resolve();
  }
}

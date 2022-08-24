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
    const { models } = testFixtureComponents;

    if (models[0] instanceof Cognite3DModel) {
      models[0].setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);
      const nodes = new TreeIndexNodeCollection([...Array(15).keys()]);
      models[0].assignStyledNodeCollection(nodes, DefaultNodeAppearance.Highlighted);
    }

    return Promise.resolve();
  }
}

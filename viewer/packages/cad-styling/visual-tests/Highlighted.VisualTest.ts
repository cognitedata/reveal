/*!
 * Copyright 2022 Cognite AS
 */

import { DefaultNodeAppearance, TreeIndexNodeCollection } from '..';

import {
  StreamingTestFixtureComponents,
  StreamingVisualTestFixture
} from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';

export default class HighlightedVisualTest extends StreamingVisualTestFixture {
  public async setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { sceneHandler, cadMaterialManager, model } = testFixtureComponents;

    const { modelIdentifier } = sceneHandler.cadModels.find(
      identifiedObject => identifiedObject.object === model.geometryNode
    )!;

    const nodes = new TreeIndexNodeCollection([...Array(15).keys()]);
    cadMaterialManager
      .getModelNodeAppearanceProvider(modelIdentifier)
      .assignStyledNodeCollection(nodes, DefaultNodeAppearance.Highlighted);

    // Styles are not applied immidiatly, so wait a little for styling to take effect
    await new Promise(resolve => setTimeout(resolve, 100));

    model.geometryNode.position.set(25, 0, -15);
    model.geometryNode.rotateY(Math.PI);
    model.geometryNode.updateMatrix();
    model.geometryNode.updateMatrixWorld();

    return Promise.resolve();
  }
}

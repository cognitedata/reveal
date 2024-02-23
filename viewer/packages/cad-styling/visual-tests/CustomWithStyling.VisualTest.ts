/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { DefaultNodeAppearance, TreeIndexNodeCollection } from '..';

import {
  StreamingTestFixtureComponents,
  StreamingVisualTestFixture
} from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';

export default class CustomWithStylingVisualTest extends StreamingVisualTestFixture {
  public async setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { sceneHandler, cadMaterialManager, model } = testFixtureComponents;

    const { modelIdentifier } = sceneHandler.cadModels.find(
      identifiedObject => identifiedObject.cadNode === model.geometryNode
    )!;

    const highlightedNodes = new TreeIndexNodeCollection([0, 2, 4, 6, 8, 10]);
    cadMaterialManager
      .getModelNodeAppearanceProvider(modelIdentifier)
      .assignStyledNodeCollection(highlightedNodes, DefaultNodeAppearance.Highlighted);

    const ghostedNodes = new TreeIndexNodeCollection([1, 3, 5, 7, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    cadMaterialManager
      .getModelNodeAppearanceProvider(modelIdentifier)
      .assignStyledNodeCollection(ghostedNodes, DefaultNodeAppearance.Ghosted);

    const sphere = new THREE.SphereGeometry(5, 32, 16);
    const sphereMesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 'red' }));
    sphereMesh.position.set(12, -3, -2);
    sceneHandler.addObject3D(sphereMesh);

    // Styles are not applied immidiatly, so wait a little for styling to take effect
    await new Promise(resolve => setTimeout(resolve, 100));

    model.geometryNode.position.set(25, 0, -15);
    model.geometryNode.rotateY(Math.PI);
    model.geometryNode.rotateX(-Math.PI / 8);
    model.geometryNode.updateMatrix();
    model.geometryNode.updateMatrixWorld();

    return Promise.resolve();
  }
}

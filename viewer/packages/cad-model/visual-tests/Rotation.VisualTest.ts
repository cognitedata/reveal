/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

import { CadNode } from '..';
import type { StreamingTestFixtureComponents } from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { StreamingVisualTestFixture } from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';

export default class RotationVisualTest extends StreamingVisualTestFixture {
  public setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { model } = testFixtureComponents;

    const cadNode = model.geometryNode;

    if (!(cadNode instanceof CadNode)) {
      return Promise.resolve();
    }

    const matrix = cadNode.getModelTransformation();
    const newMatrix = new THREE.Matrix4().multiplyMatrices(matrix, new THREE.Matrix4().makeRotationZ(-Math.PI / 3.0));
    cadNode.setModelTransformation(newMatrix);

    return Promise.resolve();
  }
}

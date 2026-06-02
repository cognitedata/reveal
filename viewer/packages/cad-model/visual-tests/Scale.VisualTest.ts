/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

import { CadNode } from '..';
import type { StreamingTestFixtureComponents } from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { StreamingVisualTestFixture } from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';

export default class ScaleVisualTest extends StreamingVisualTestFixture {
  public setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { model } = testFixtureComponents;

    const cadNode = model.geometryNode;

    if (!(cadNode instanceof CadNode)) {
      return Promise.resolve();
    }

    const matrix = cadNode.getModelTransformation();
    const newMatrix = matrix.scale(new THREE.Vector3(5, 5, 5));
    cadNode.setModelTransformation(newMatrix);

    return Promise.resolve();
  }
}

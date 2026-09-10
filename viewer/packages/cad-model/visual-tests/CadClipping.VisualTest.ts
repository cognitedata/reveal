/*!
 * Copyright 2022 Cognite AS
 */

import { Box3, Vector3 } from 'three';

import { BoundingBoxClipper, CadNode } from '..';
import type { StreamingTestFixtureComponents } from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { StreamingVisualTestFixture } from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';

export default class CadClippingVisualTest extends StreamingVisualTestFixture {
  public setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { model, cadManager } = testFixtureComponents;

    if (!(model.geometryNode instanceof CadNode)) {
      return Promise.resolve();
    }

    const params = {
      width: 10,
      height: 10,
      depth: 10,
      x: 0,
      y: 0,
      z: 0
    };

    const boxClipper = new BoundingBoxClipper(
      new Box3(
        new Vector3(params.x - params.width / 2, params.y - params.height / 2, params.z - params.depth / 1.5),
        new Vector3(params.x + params.width / 1.5, params.y + params.height / 2, params.z + params.depth / 2)
      )
    );

    cadManager.clippingPlanes = boxClipper.clippingPlanes;

    return Promise.resolve();
  }
}

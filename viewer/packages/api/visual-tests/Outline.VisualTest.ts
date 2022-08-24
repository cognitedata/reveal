/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import { NodeOutlineColor, TreeIndexNodeCollection } from '@reveal/cad-styling';
import { IndexSet, NumericRange } from '@reveal/utilities';
import { Cognite3DModel } from '..';

import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';

// Sanity test for loading model
export default class DefaultVisualTest extends ViewerVisualTestFixture {
  public setup(testFixtureComponents: ViewerTestFixtureComponents): Promise<void> {
    const { viewer, model } = testFixtureComponents;

    viewer.setBackgroundColor(new THREE.Color('lightGray'));

    if (model instanceof Cognite3DModel) {
      model.setRotationFromEuler(new THREE.Euler(Math.PI / 4, 0, 0));
      model.updateMatrix();
      model.updateMatrixWorld();

      const nodesPerColor = 10;
      for (let color = 0; color < 8; ++color) {
        const indexes = new IndexSet();
        indexes.addRange(new NumericRange(nodesPerColor * color, 10));
        const nodes = new TreeIndexNodeCollection(indexes);
        model.assignStyledNodeCollection(nodes, { outlineColor: color as NodeOutlineColor });
      }
    }

    return Promise.resolve();
  }
}

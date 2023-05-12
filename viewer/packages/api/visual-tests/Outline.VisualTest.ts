/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import { NodeOutlineColor, TreeIndexNodeCollection } from '@reveal/cad-styling';
import { IndexSet, NumericRange } from '@reveal/utilities';
import { CogniteCadModel } from '..';

import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';

export default class OutlineVisualTest extends ViewerVisualTestFixture {
  public setup(testFixtureComponents: ViewerTestFixtureComponents): Promise<void> {
    const { viewer, models } = testFixtureComponents;

    viewer.setBackgroundColor({ color: new THREE.Color('lightgray') });

    const model = models[0];

    if (model instanceof CogniteCadModel) {
      const matrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI / 4, 0, 0));
      model.setModelTransformation(matrix);

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

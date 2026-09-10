/*!
 * Copyright 2022 Cognite AS
 */
import { Color, Euler, Matrix4 } from 'three';
import type { NodeOutlineColor } from '@reveal/cad-styling';
import { TreeIndexNodeCollection } from '@reveal/cad-styling';
import { IndexSet, NumericRange } from '@reveal/utilities';
import { CogniteCadModel } from '..';

import type { ViewerTestFixtureComponents } from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';
import { ViewerVisualTestFixture } from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';

export default class OutlineVisualTest extends ViewerVisualTestFixture {
  public setup(testFixtureComponents: ViewerTestFixtureComponents): Promise<void> {
    const { viewer, models } = testFixtureComponents;

    viewer.setBackgroundColor({ color: new Color('lightgray') });

    const model = models[0];

    if (model instanceof CogniteCadModel) {
      const matrix = new Matrix4().makeRotationFromEuler(new Euler(Math.PI / 4, 0, 0));
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

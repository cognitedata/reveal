/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { CogniteCadModel } from '..';
import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';
import { NumericRange } from '@reveal/utilities';

export default class NodeTransformVisualTest extends ViewerVisualTestFixture {
  public async setup(testFixtureComponents: ViewerTestFixtureComponents): Promise<void> {
    const { models } = testFixtureComponents;

    const model = models[0];

    const modelTransform = new THREE.Matrix4().makeTranslation(25, -5, 5);
    modelTransform.multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI / 4, Math.PI / 2, 0)));

    if (model instanceof CogniteCadModel) {
      const scale = new THREE.Matrix4().makeScale(3, 3, 3);
      const rotation = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.PI / 6, 0, 0));
      const translation = new THREE.Matrix4().makeTranslation(-50, 25, 0);

      const transform = translation.multiply(rotation.multiply(scale));
      model.setNodeTransform(new NumericRange(1, 1), transform);

      Array.from({ length: 80 - 2 }, (_, k) => k + 2).map(i => {
        return model.setNodeTransform(
          new NumericRange(i, 1),
          new THREE.Matrix4().makeTranslation(0, (((i + 1) % 2) * 2 - 1) * 2, 0)
        );
      });
    }

    model.setModelTransformation(modelTransform);

    return Promise.resolve();
  }
}

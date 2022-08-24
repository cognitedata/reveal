/*!
 * Copyright 2022 Cognite AS
 */
import { Cognite3DModel } from '..';
import * as THREE from 'three';

import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';
import { DefaultNodeAppearance } from '@reveal/cad-styling';

export default class TwoModelsVisualTest extends ViewerVisualTestFixture {
  constructor() {
    super('primitives', 'primitives');
  }
  public setup(testFixtureComponents: ViewerTestFixtureComponents): Promise<void> {
    const { models } = testFixtureComponents;

    const model = models[1];

    if (!(model instanceof Cognite3DModel)) {
      return Promise.resolve();
    }

    model.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);

    const translation = new THREE.Matrix4().makeTranslation(0, 0, 5);
    const transform = model.getModelTransformation();
    transform.multiply(translation);
    model.setModelTransformation(transform);

    return Promise.resolve();
  }
}

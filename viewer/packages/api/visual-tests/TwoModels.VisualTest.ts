/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';
import { DefaultNodeAppearance } from '@reveal/cad-styling';
import { CogniteCadModel } from '@reveal/cad-model';

export default class TwoModelsVisualTest extends ViewerVisualTestFixture {
  constructor() {
    super('primitives', 'primitives');
  }

  public async setup(testFixtureComponents: ViewerTestFixtureComponents): Promise<void> {
    const { models } = testFixtureComponents;
    const model = models[1];

    if (!(model instanceof CogniteCadModel)) {
      return Promise.resolve();
    }

    model.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);

    const translation = new THREE.Matrix4().makeTranslation(0, 5, 0);
    const transform = model.getModelTransformation();
    transform.multiply(translation);
    model.setModelTransformation(transform);
  }

  public dispose(): void {
    // Keep base disposal
    super.dispose();
  }
}

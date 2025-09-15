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
    super('primitives', 'primitives', 'primitives');
  }

  // Use standard base class loading since caching issue is fixed

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
  //   const model2 = models[2];

  //   if (!(model2 instanceof CogniteCadModel)) {
  //     return Promise.resolve();
  //   }

  //   model2.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);

  //   const translation2 = new THREE.Matrix4().makeTranslation(0, 10, 0);
  //   const transform2 = model2.getModelTransformation();
  //   transform2.multiply(translation2);
  //   model2.setModelTransformation(transform2);
  }

  public dispose(): void {
    // Keep base disposal
    super.dispose();
  }
}

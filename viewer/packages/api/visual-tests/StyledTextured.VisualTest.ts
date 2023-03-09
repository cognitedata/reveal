/*!
 * Copyright 2022 Cognite AS
 */

import { CogniteCadModel } from '@reveal/cad-model';
import { DefaultNodeAppearance } from '@reveal/cad-styling';
import {
  ViewerTestFixtureComponents,
  ViewerVisualTestFixture
} from '../../../visual-tests/test-fixtures/ViewerVisualTestFixture';

export default class StyledTexturedVisualTest extends ViewerVisualTestFixture {
  constructor() {
    super('textured');
  }

  public setup(components: ViewerTestFixtureComponents): Promise<void> {
    const model = components.models[0];
    if (!(model instanceof CogniteCadModel)) {
      return Promise.resolve();
    }

    model.setDefaultNodeAppearance(DefaultNodeAppearance.Highlighted);

    return Promise.resolve();
  }
}

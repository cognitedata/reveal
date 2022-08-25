/*!
 * Copyright 2022 Cognite AS
 */

import { NumericRange } from '@reveal/utilities';
import * as THREE from 'three';
import {
  StreamingTestFixtureComponents,
  StreamingVisualTestFixture
} from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { DefaultRenderPipelineProvider } from '../src/render-pipeline-providers/DefaultRenderPipelineProvider';
import { defaultRenderOptions } from '../src/rendering/types';

export default class SsaoVisualTest extends StreamingVisualTestFixture {
  public setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { model, sceneHandler, cadMaterialManager } = testFixtureComponents;

    const { modelIdentifier } = sceneHandler.cadModels.find(
      identifiedObject => identifiedObject.object === model.geometryNode
    )!;

    const transformProvider = cadMaterialManager.getModelNodeTransformProvider(modelIdentifier);
    transformProvider.setNodeTransform(new NumericRange(1, 1), new THREE.Matrix4().makeTranslation(4, 0, 0));

    const renderOptions = defaultRenderOptions;
    renderOptions.ssaoRenderParameters = {
      sampleSize: 256,
      sampleRadius: 1.0,
      depthCheckBias: 0.0125
    };

    (this.pipelineProvider as DefaultRenderPipelineProvider).renderOptions = renderOptions;

    const matrix = new THREE.Matrix4()
      .makeTranslation(10.5, -1, 15)
      .multiply(model.geometryNode.getModelTransformation());

    model.geometryNode.setModelTransformation(matrix);

    return Promise.resolve();
  }
}

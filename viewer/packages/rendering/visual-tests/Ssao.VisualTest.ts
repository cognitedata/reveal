/*!
 * Copyright 2022 Cognite AS
 */

import { NumericRange } from '@reveal/utilities';
import { Matrix4 } from 'three';
import type { StreamingTestFixtureComponents } from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { StreamingVisualTestFixture } from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import type { DefaultRenderPipelineProvider } from '../src/render-pipeline-providers/DefaultRenderPipelineProvider';
import { defaultRenderOptions, SsaoSampleQuality } from '../src/rendering/types';

export default class SsaoVisualTest extends StreamingVisualTestFixture {
  public setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { model, sceneHandler, cadMaterialManager } = testFixtureComponents;

    const { modelIdentifier } = sceneHandler.cadModels.find(
      identifiedObject => identifiedObject.cadNode === model.geometryNode
    )!;

    const transformProvider = cadMaterialManager.getModelNodeTransformProvider(modelIdentifier);
    transformProvider.setNodeTransform(new NumericRange(1, 1), new Matrix4().makeTranslation(4, 0, 0));

    const renderOptions = defaultRenderOptions;
    renderOptions.ssaoRenderParameters = {
      sampleSize: SsaoSampleQuality.VeryHigh,
      sampleRadius: 1.0,
      depthCheckBias: 0.0125
    };

    (this.pipelineProvider as DefaultRenderPipelineProvider).renderOptions = renderOptions;

    const matrix = new Matrix4().makeTranslation(10.5, -1, 15);

    model.geometryNode.setModelTransformation(matrix);

    return Promise.resolve();
  }
}

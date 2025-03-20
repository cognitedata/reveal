/*!
 * Copyright 2022 Cognite AS
 */

import { StreamingTestFixtureComponents } from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { StreamingVisualTestFixture } from '../../../visual-tests';
import { DefaultRenderPipelineProvider } from '../src/render-pipeline-providers/DefaultRenderPipelineProvider';
import { defaultRenderOptions, RenderOptions } from '../src/rendering/types';
import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@reveal/cad-styling';
import { NumericRange } from '@reveal/utilities';

export default class BlendingTestFixture extends StreamingVisualTestFixture {
  public async setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { cadMaterialManager, pcMaterialManager, sceneHandler, model } = testFixtureComponents;

    if (model.geometryNode.type !== 'CadNode') {
      return Promise.resolve();
    }

    const renderOptions = { ...defaultRenderOptions, multiSampleCountHint: 4 } as RenderOptions;
    this.pipelineProvider = new DefaultRenderPipelineProvider(
      cadMaterialManager,
      pcMaterialManager,
      sceneHandler,
      renderOptions
    );

    this.render();

    const nodeAppearanceProvider = cadMaterialManager.getModelNodeAppearanceProvider('local: primitives');
    nodeAppearanceProvider.assignStyledNodeCollection(
      new TreeIndexNodeCollection(new NumericRange(0, 100)),
      DefaultNodeAppearance.Ghosted
    );
    nodeAppearanceProvider.assignStyledNodeCollection(
      new TreeIndexNodeCollection(new NumericRange(10, 20)),
      DefaultNodeAppearance.Highlighted
    );

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

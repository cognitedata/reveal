/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { It, Mock, Times } from 'moq.ts';
import { BasicPipelineExecutor } from './BasicPipelineExecutor';
import { RenderPass } from '../RenderPass';
import { RenderPipelineProvider } from '../RenderPipelineProvider';

describe(BasicPipelineExecutor.name, () => {
  let basicPipelineExecutor: BasicPipelineExecutor;
  beforeEach(() => {
    const rendererMock = new Mock<THREE.WebGLRenderer>()
      .setup(p => (p.info.autoReset = It.IsAny()))
      .callback(() => true)
      .setup(p => p.info.reset())
      .returns();
    basicPipelineExecutor = new BasicPipelineExecutor(rendererMock.object());
  });

  test('Basic pipeline executor can succsessfully execute a render pipeline', () => {
    const mockCamera = new Mock<THREE.PerspectiveCamera>();

    const firstRenderPassMock = new Mock<RenderPass>().setup(p => p.render(It.IsAny(), It.IsAny())).returns();
    const secondRenderPassMock = new Mock<RenderPass>().setup(p => p.render(It.IsAny(), It.IsAny())).returns();

    const pipelineMock = new Mock<RenderPipelineProvider>()
      .setup(p => p.pipeline(It.IsAny()))
      .returns(
        (function* (): Generator<RenderPass> {
          yield firstRenderPassMock.object();
          yield secondRenderPassMock.object();
        })()
      );

    basicPipelineExecutor.render(pipelineMock.object(), mockCamera.object());

    firstRenderPassMock.verify(p => p.render, Times.Once());
    secondRenderPassMock.verify(p => p.render, Times.Once());
  });
});

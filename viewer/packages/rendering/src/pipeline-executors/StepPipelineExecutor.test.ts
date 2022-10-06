/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { It, Mock, Times } from 'moq.ts';
import { RenderPass } from '../RenderPass';
import { StepPipelineExecutor } from './StepPipelineExecutor';
import { RenderPipelineProvider } from '../RenderPipelineProvider';

describe(StepPipelineExecutor.name, () => {
  let stepPipelineExecutor: StepPipelineExecutor;
  beforeEach(() => {
    const rendererMock = new Mock<THREE.WebGLRenderer>()
      .setup(p => (p.info.autoReset = It.IsAny()))
      .callback(() => true)
      .setup(p => p.info.reset())
      .returns()
      .setup(p => p.getContext())
      .returns(
        new Mock<WebGL2RenderingContext>()
          .setup(q => q.getExtension(It.IsAny()))
          .returns(null)
          .object()
      )
      .setup(p => p.setRenderTarget(It.IsAny()))
      .returns();
    stepPipelineExecutor = new StepPipelineExecutor(rendererMock.object());
  });

  test('StepPipelineExecutor pipeline executor can succsessfully execute a render pipeline', () => {
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

    stepPipelineExecutor.render(pipelineMock.object(), mockCamera.object());

    firstRenderPassMock.verify(p => p.render, Times.Once());
    secondRenderPassMock.verify(p => p.render, Times.Once());
  });

  test('StepPipelineExecutor pipeline executor can succsessfully partially execute a render pipeline', () => {
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

    stepPipelineExecutor.numberOfSteps = 1;
    stepPipelineExecutor.render(pipelineMock.object(), mockCamera.object());

    firstRenderPassMock.verify(p => p.render, Times.Once());
    secondRenderPassMock.verify(p => p.render, Times.Never());
  });

  test('StepPipelineExecutor pipeline executor can count the number of steps for a pipeline', () => {
    const firstRenderPassMock = new Mock<RenderPass>().setup(p => p.render(It.IsAny(), It.IsAny())).returns();
    const secondRenderPassMock = new Mock<RenderPass>().setup(p => p.render(It.IsAny(), It.IsAny())).returns();
    const thirdRenderPassMock = new Mock<RenderPass>().setup(p => p.render(It.IsAny(), It.IsAny())).returns();

    const pipelineMock = new Mock<RenderPipelineProvider>()
      .setup(p => p.pipeline(It.IsAny()))
      .returns(
        (function* (): Generator<RenderPass> {
          yield firstRenderPassMock.object();
          yield secondRenderPassMock.object();
          yield thirdRenderPassMock.object();
        })()
      );

    expect(stepPipelineExecutor.calcNumSteps(pipelineMock.object())).toEqual(3);
  });
});

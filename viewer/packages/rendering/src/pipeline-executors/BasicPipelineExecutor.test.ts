/*!
 * Copyright 2021 Cognite AS
 */

import { PerspectiveCamera, Vector2, Vector4, WebGLRenderTarget, type WebGLRenderer } from 'three';
import { It, Mock, Times } from 'moq.ts';
import { getRenderSize } from '@reveal/utilities';
import { BasicPipelineExecutor } from './BasicPipelineExecutor';
import type { RenderPass } from '../RenderPass';
import type { RenderPipelineProvider } from '../RenderPipelineProvider';
import type { SettableRenderTarget } from '../rendering/SettableRenderTarget';

describe(BasicPipelineExecutor.name, () => {
  let basicPipelineExecutor: BasicPipelineExecutor;
  beforeEach(() => {
    const rendererMock = new Mock<WebGLRenderer>()
      .setup(p => (p.info.autoReset = It.IsAny()))
      .callback(() => true)
      .setup(p => p.info.reset())
      .returns();
    basicPipelineExecutor = new BasicPipelineExecutor(rendererMock.object());
  });

  test('Basic pipeline executor can succsessfully execute a render pipeline', () => {
    const mockCamera = new Mock<PerspectiveCamera>();

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

  describe('renderViews', () => {
    type PassRecord = {
      camera: PerspectiveCamera;
      outputTarget: WebGLRenderTarget | null;
      viewport: Vector4;
      scissor: Vector4;
      scissorTest: boolean;
      renderSize: Vector2;
      xrEnabled: boolean;
    };

    function createRenderer(): WebGLRenderer {
      const renderer = {
        info: { autoReset: true, reset: () => {} },
        xr: { enabled: true },
        getDrawingBufferSize: (target: Vector2) => target.set(1920, 1080)
      };
      return renderer as unknown as WebGLRenderer;
    }

    function createPipeline(records: PassRecord[]): RenderPipelineProvider & SettableRenderTarget {
      const pipeline = {
        outputRenderTarget: null as WebGLRenderTarget | null,
        autoSizeOutputRenderTarget: true,
        setOutputRenderTarget(target: WebGLRenderTarget | null, autoSize?: boolean) {
          pipeline.outputRenderTarget = target;
          if (autoSize !== undefined) pipeline.autoSizeOutputRenderTarget = autoSize;
        },
        *pipeline(renderer: WebGLRenderer): Generator<RenderPass> {
          yield {
            render: (_renderer: WebGLRenderer, camera: PerspectiveCamera) => {
              const output = pipeline.outputRenderTarget!;
              records.push({
                camera,
                outputTarget: output,
                viewport: output.viewport.clone(),
                scissor: output.scissor.clone(),
                scissorTest: output.scissorTest,
                renderSize: getRenderSize(renderer, new Vector2()),
                xrEnabled: renderer.xr.enabled
              });
            }
          };
        },
        dispose() {}
      };
      return pipeline;
    }

    test('runs the pipeline once per view into its viewport and restores state', () => {
      const renderer = createRenderer();
      const executor = new BasicPipelineExecutor(renderer);
      const records: PassRecord[] = [];
      const pipeline = createPipeline(records);
      const output = new WebGLRenderTarget(2000, 1000);
      const left = { camera: new PerspectiveCamera(), viewport: new Vector4(0, 0, 1000, 1000) };
      const right = { camera: new PerspectiveCamera(), viewport: new Vector4(1000, 0, 1000, 1000) };

      executor.renderViews(pipeline, output, [left, right]);

      expect(records).toHaveLength(2);
      expect(records[0].camera).toBe(left.camera);
      expect(records[1].camera).toBe(right.camera);
      for (const [record, view] of [
        [records[0], left],
        [records[1], right]
      ] as const) {
        expect(record.outputTarget).toBe(output);
        expect(record.viewport).toEqual(view.viewport);
        expect(record.scissor).toEqual(view.viewport);
        expect(record.scissorTest).toBe(true);
        expect(record.renderSize).toEqual(new Vector2(1000, 1000));
        expect(record.xrEnabled).toBe(false);
      }

      expect(pipeline.outputRenderTarget).toBeNull();
      expect(pipeline.autoSizeOutputRenderTarget).toBe(true);
      expect(output.viewport).toEqual(new Vector4(0, 0, 2000, 1000));
      expect(output.scissorTest).toBe(false);
      expect(renderer.xr.enabled).toBe(true);
      expect(getRenderSize(renderer, new Vector2())).toEqual(new Vector2(1920, 1080));
    });

    test('skips empty views', () => {
      const records: PassRecord[] = [];
      const executor = new BasicPipelineExecutor(createRenderer());
      const output = new WebGLRenderTarget(100, 100);

      executor.renderViews(createPipeline(records), output, [
        { camera: new PerspectiveCamera(), viewport: new Vector4(0, 0, 100, 100) },
        { camera: new PerspectiveCamera(), viewport: new Vector4(100, 0, 0, 100) }
      ]);

      expect(records).toHaveLength(1);
    });
  });
});

/*!
 * Copyright 2021 Cognite AS
 */
import type { WebGLRenderer } from 'three';
import { PerspectiveCamera, Plane, Vector4, WebGLRenderTarget } from 'three';

import { createRevealManager } from './createRevealManager';
import { RevealManager } from './RevealManager';
import type { LoadingStateChangeListener } from './RevealManager';

import type {
  DMDataSourceType,
  ModelDataProvider,
  ModelIdentifier,
  ModelMetadataProvider,
  PointCloudStylableObjectProvider
} from '@reveal/data-providers';
import type { CadManager, SectorCuller } from '@reveal/cad-geometry-loaders';
import { SceneHandler } from '@reveal/utilities';
import type { PointCloudManager } from '@reveal/pointclouds';
import { LocalPointClassificationsProvider } from '@reveal/pointclouds';
import type { SetPropertyExpression } from 'moq.ts';
import { It, Mock } from 'moq.ts';
import type { CameraManager } from '@reveal/camera-manager';
import type { CadNode } from '@reveal/cad-model';
import type {
  RenderPipelineExecutor,
  RenderPipelineProvider,
  RenderView,
  ResizeHandler,
  SettableRenderTarget
} from '@reveal/rendering';
import { vi } from 'vitest';
import { NEVER } from 'rxjs';

describe('RevealManager', () => {
  const stubMetadataProvider: ModelMetadataProvider = {} as any;
  const stubDataProvider: ModelDataProvider = {} as any;
  const sectorCuller = new Mock<SectorCuller>()
    .setup(p => p.determineSectors(It.IsAny()))
    .returns({
      wantedSectors: [],
      spentBudget: {} as ReturnType<SectorCuller['determineSectors']>['spentBudget']
    })
    .setup(p => p.dispose)
    .returns(vi.fn())
    .object();

  const annotationProvider = new Mock<PointCloudStylableObjectProvider>()
    .setup(p => p.getPointCloudObjects(It.IsAny()))
    .returns(Promise.resolve([]))
    .object();
  const pointCloudVolumeDMProvider = new Mock<PointCloudStylableObjectProvider<DMDataSourceType>>()
    .setup(p => p.getPointCloudObjects(It.IsAny()))
    .returns(Promise.resolve([]))
    .object();
  const pointClassificationsProvider = new LocalPointClassificationsProvider();
  let manager: RevealManager;

  let onChangeListeners: (() => void)[];
  let onStopListeners: (() => void)[];

  const cameraManagerMock = new Mock<CameraManager>()
    .setup(p => p.on('cameraChange', It.IsAny()))
    .callback(({ args: [_eventType, callback] }) => onChangeListeners.push(callback))
    .setup(p => p.on('cameraStop', It.IsAny()))
    .callback(({ args: [_eventType, callback] }) => onStopListeners.push(callback))
    .setup(p => p.off(It.IsAny(), It.IsAny()))
    .returns();

  beforeEach(() => {
    vi.clearAllMocks();

    onChangeListeners = [];
    onStopListeners = [];

    const rendererMock = new Mock<WebGLRenderer>()
      .setup(_ => It.Is((expression: SetPropertyExpression) => expression.name === 'info'))
      .returns({})
      .setup(p => p.domElement)
      .returns(
        new Mock<HTMLCanvasElement>()
          .setup(p => p.parentElement)
          .returns(new Mock<HTMLElement>().object())
          .object()
      );

    manager = createRevealManager(
      'test',
      'myAppId',
      stubMetadataProvider,
      stubDataProvider,
      annotationProvider,
      pointCloudVolumeDMProvider,
      pointClassificationsProvider,
      rendererMock.object(),
      new SceneHandler(),
      cameraManagerMock.object(),
      {
        internal: { cad: { sectorCuller } },
        logMetrics: false
      }
    );

    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test('resetRedraw() resets needsRedraw', () => {
    manager.requestRedraw();
    expect(manager.needsRedraw).toBeTruthy();
    manager.resetRedraw();
    expect(manager.needsRedraw).toBeFalsy();
  });

  test('set clippingPlanes triggers redraw', () => {
    expect(manager.needsRedraw).toBeFalsy();
    const planes = [new Plane(), new Plane()];
    manager.clippingPlanes = planes;
    expect(manager.needsRedraw).toBeTruthy();
  });

  test('updates triggers after camera move event, but not after stop event has fired', () => {
    manager.resetRedraw();

    expect(manager.needsRedraw).toBeFalsy();

    const camera = new PerspectiveCamera(70, 1, 0.1, 100);

    onChangeListeners.forEach(callback => callback());

    manager.resetRedraw();
    manager.update(camera);
    expect(manager.needsRedraw).toBeTruthy();

    onStopListeners.forEach(callback => callback());

    manager.resetRedraw();
    expect(manager.needsRedraw).toBeFalsy();
  });

  test('cameraInMotion reflects camera change/stop events', () => {
    expect(manager.cameraInMotion).toBe(false);

    onChangeListeners.forEach(callback => callback());
    expect(manager.cameraInMotion).toBe(true);

    onStopListeners.forEach(callback => callback());
    expect(manager.cameraInMotion).toBe(false);
  });

  test('dispose() disposes culler', () => {
    manager.dispose();
    expect(sectorCuller.dispose).toHaveBeenCalled();
  });

  test('loadingStateChanged is not triggered if loading state doesnt change', () => {
    const camera = new PerspectiveCamera(60, 1, 0.5, 100);
    const loadingStateChangedCb: LoadingStateChangeListener = vi.fn();
    manager.on('loadingStateChanged', loadingStateChangedCb);

    manager.update(camera);
    vi.advanceTimersByTime(10000);

    expect(loadingStateChangedCb).toHaveBeenCalledTimes(0);
  });

  test('addModel routes DM and Classic CAD models to correct identifier types', async () => {
    let dmIdentifier: ModelIdentifier | undefined;
    let classicIdentifier: ModelIdentifier | undefined;
    const cadNodeStub = {} as Partial<CadNode> as CadNode;
    const addModelMock = vi
      .fn<CadManager['addModel']>()
      .mockImplementationOnce(async identifier => {
        dmIdentifier = identifier;
        return cadNodeStub;
      })
      .mockImplementationOnce(async identifier => {
        classicIdentifier = identifier;
        return cadNodeStub;
      });
    const rm = new RevealManager(
      { on: vi.fn(), off: vi.fn(), addModel: addModelMock } as Partial<CadManager> as CadManager,
      { getLoadingStateObserver: () => NEVER } as Partial<PointCloudManager> as PointCloudManager,
      {} as Partial<RenderPipelineExecutor> as RenderPipelineExecutor,
      {} as Partial<RenderPipelineProvider & SettableRenderTarget> as RenderPipelineProvider & SettableRenderTarget,
      {} as Partial<ResizeHandler> as ResizeHandler,
      cameraManagerMock.object()
    );

    await rm.addModel('cad', {
      revisionExternalId: 'ext',
      revisionSpace: 'space',
      classicModelRevisionId: { modelId: 1, revisionId: 2 }
    });
    await rm.addModel('cad', { modelId: 10, revisionId: 20, classicModelRevisionId: { modelId: 10, revisionId: 20 } });

    expect(dmIdentifier).toMatchObject({
      modelId: 1,
      revisionId: 2,
      revisionExternalId: 'ext',
      revisionSpace: 'space'
    });

    expect(classicIdentifier).toMatchObject({ modelId: 10, revisionId: 20 });
    expect(classicIdentifier).not.toHaveProperty('revisionExternalId');
    expect(classicIdentifier).not.toHaveProperty('revisionSpace');
  });

  describe('with stubbed managers', () => {
    function createStubbedManager() {
      const cadManager = { on: vi.fn(), off: vi.fn(), updateCamera: vi.fn(), resetRedraw: vi.fn() };
      const pointCloudManager = { getLoadingStateObserver: () => NEVER, updateCamera: vi.fn(), resetRedraw: vi.fn() };
      const pipelineExecutor = { render: vi.fn(), renderViews: vi.fn(), dispose: vi.fn() };
      const renderPipeline = {} as RenderPipelineProvider & SettableRenderTarget;
      const resizeHandler = { handleResize: vi.fn(), resetRedraw: vi.fn() };
      const revealManager = new RevealManager(
        cadManager as Partial<CadManager> as CadManager,
        pointCloudManager as Partial<PointCloudManager> as PointCloudManager,
        pipelineExecutor as RenderPipelineExecutor,
        renderPipeline,
        resizeHandler as Partial<ResizeHandler> as ResizeHandler,
        cameraManagerMock.object()
      );
      return { revealManager, cadManager, pointCloudManager, pipelineExecutor, renderPipeline, resizeHandler };
    }

    test('renderViews() renders all views through the pipeline executor without resizing', () => {
      const { revealManager, pipelineExecutor, renderPipeline, resizeHandler, cadManager } = createStubbedManager();
      const output = new WebGLRenderTarget(2000, 1000);
      const views: RenderView[] = [
        { camera: new PerspectiveCamera(), viewport: new Vector4(0, 0, 1000, 1000) },
        { camera: new PerspectiveCamera(), viewport: new Vector4(1000, 0, 1000, 1000) }
      ];

      revealManager.renderViews(output, views);

      expect(pipelineExecutor.renderViews).toHaveBeenCalledWith(renderPipeline, output, views);
      expect(pipelineExecutor.render).not.toHaveBeenCalled();
      expect(resizeHandler.handleResize).not.toHaveBeenCalled();
      expect(cadManager.resetRedraw).toHaveBeenCalled();
    });

    test('update() with an explicit cameraInMotion overrides the camera manager state', () => {
      const { revealManager, cadManager, pointCloudManager } = createStubbedManager();
      const camera = new PerspectiveCamera();

      revealManager.update(camera, true);

      expect(revealManager.cameraInMotion).toBe(false);
      expect(cadManager.updateCamera).toHaveBeenCalledWith(camera, true);
      expect(pointCloudManager.updateCamera).toHaveBeenCalledWith(camera);
    });

    test('update() without cameraInMotion uses the camera manager state', () => {
      const { revealManager, cadManager, pointCloudManager } = createStubbedManager();
      const camera = new PerspectiveCamera();

      revealManager.update(camera);

      expect(cadManager.updateCamera).toHaveBeenCalledWith(camera, false);
      expect(pointCloudManager.updateCamera).not.toHaveBeenCalled();
    });
  });
});

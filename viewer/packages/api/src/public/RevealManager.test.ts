/*!
 * Copyright 2021 Cognite AS
 */
import type { WebGLRenderer } from 'three';
import { PerspectiveCamera, Plane, Vector3 } from 'three';

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
import { PickCacheInvalidator, SceneHandler } from '@reveal/utilities';
import type { PointCloudManager } from '@reveal/pointclouds';
import { LocalPointClassificationsProvider } from '@reveal/pointclouds';
import type { SetPropertyExpression } from 'moq.ts';
import { It, Mock } from 'moq.ts';
import type { CameraChangeDelegate, CameraManager } from '@reveal/camera-manager';
import type { CadNode } from '@reveal/cad-model';
import type {
  RenderPipelineExecutor,
  RenderPipelineProvider,
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

  let onChangeListeners: CameraChangeDelegate[];
  let onStopListeners: (() => void)[];
  let camera: PerspectiveCamera;

  const cameraManagerMock = new Mock<CameraManager>()
    .setup(p => p.on('cameraChange', It.IsAny()))
    .callback(({ args: [_eventType, callback] }) => onChangeListeners.push(callback))
    .setup(p => p.on('cameraStop', It.IsAny()))
    .callback(({ args: [_eventType, callback] }) => onStopListeners.push(callback))
    .setup(p => p.getCamera())
    .callback(() => camera)
    .setup(p => p.off(It.IsAny(), It.IsAny()))
    .returns();

  beforeEach(() => {
    vi.clearAllMocks();

    camera = new PerspectiveCamera(70, 1, 0.1, 100);
    camera.position.set(1, 2, 3);
    camera.updateProjectionMatrix();
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

    onChangeListeners.forEach(callback => callback(new Vector3(1, 2, 3), new Vector3(0, 0, 0)));

    manager.resetRedraw();
    manager.update(camera);
    expect(manager.needsRedraw).toBeTruthy();

    onStopListeners.forEach(callback => callback());

    manager.resetRedraw();
    expect(manager.needsRedraw).toBeFalsy();
  });

  test('cameraInMotion reflects camera change/stop events', () => {
    expect(manager.cameraInMotion).toBe(false);

    onChangeListeners.forEach(callback => callback(new Vector3(1, 2, 3), new Vector3(0, 0, 0)));
    expect(manager.cameraInMotion).toBe(true);

    onStopListeners.forEach(callback => callback());
    expect(manager.cameraInMotion).toBe(false);
  });

  describe('pick cache invalidation on camera change', () => {
    function fireCameraChange(): boolean {
      onChangeListeners.forEach(callback => callback(camera.position.clone(), new Vector3()));
      return manager.pickCacheInvalidator.consume();
    }

    beforeEach(() => {
      expect(fireCameraChange()).toBe(true);
    });

    test('is not requested when the camera reports a change without having moved', () => {
      expect(fireCameraChange()).toBe(false);
    });

    test('is requested when the camera position changes', () => {
      camera.position.set(1, 2, 4);
      expect(fireCameraChange()).toBe(true);
    });

    test('is requested when the camera rotates', () => {
      camera.rotateY(0.1);
      expect(fireCameraChange()).toBe(true);
    });

    test('is requested when the projection changes', () => {
      camera.fov = 30;
      camera.updateProjectionMatrix();
      expect(fireCameraChange()).toBe(true);
    });

    test('is not requested again until the camera changes once more', () => {
      camera.position.set(1, 2, 4);
      expect(fireCameraChange()).toBe(true);
      expect(fireCameraChange()).toBe(false);
    });
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
      cameraManagerMock.object(),
      new PickCacheInvalidator()
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
});

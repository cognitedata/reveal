/*!
 * Copyright 2021 Cognite AS
 */
import type { WebGLRenderer } from 'three';
import { PerspectiveCamera, Plane } from 'three';

import { createRevealManager } from './createRevealManager';
import { RevealManager } from './RevealManager';
import type { LoadingStateChangeListener } from './RevealManager';

import type {
  DMDataSourceType,
  ModelDataProvider,
  ModelMetadataProvider,
  PointCloudStylableObjectProvider
} from '@reveal/data-providers';
import { CdfModelIdentifier, DMModelIdentifier } from '@reveal/data-providers';
import type { CadManager, SectorCuller } from '@reveal/cad-geometry-loaders';
import { SceneHandler } from '@reveal/utilities';
import { LocalPointClassificationsProvider, PointCloudManager } from '@reveal/pointclouds';
import type { SetPropertyExpression } from 'moq.ts';
import { It, Mock } from 'moq.ts';
import type { CameraManager } from '@reveal/camera-manager';
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
    const addModelMock = vi.fn<CadManager['addModel']>().mockResolvedValue({} as Partial<CadNode> as CadNode);
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
    const dmId = addModelMock.mock.calls[0][0] as DMModelIdentifier;
    expect(dmId).toBeInstanceOf(DMModelIdentifier);
    expect(dmId.modelId).toBe(1);
    expect(dmId.revisionId).toBe(2);

    addModelMock.mockClear();
    await rm.addModel('cad', { modelId: 10, revisionId: 20, classicModelRevisionId: { modelId: 10, revisionId: 20 } });
    expect(addModelMock.mock.calls[0][0]).toBeInstanceOf(CdfModelIdentifier);
  });
});

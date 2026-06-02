/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { createRevealManager } from './createRevealManager';
import { RevealManager, LoadingStateChangeListener } from './RevealManager';

import {
  DMDataSourceType,
  ModelDataProvider,
  ModelMetadataProvider,
  PointCloudStylableObjectProvider
} from '@reveal/data-providers';
import { SectorCuller } from '@reveal/cad-geometry-loaders';
import { SceneHandler } from '@reveal/utilities';
import { LocalPointClassificationsProvider } from '@reveal/pointclouds';
import { It, Mock, SetPropertyExpression } from 'moq.ts';
import { CameraManager } from '@reveal/camera-manager';
import { PerspectiveCamera } from 'three';

import { vi } from 'vitest';

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

    const rendererMock = new Mock<THREE.WebGLRenderer>()
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
    const planes = [new THREE.Plane(), new THREE.Plane()];
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
    const camera = new THREE.PerspectiveCamera(60, 1, 0.5, 100);
    const loadingStateChangedCb: LoadingStateChangeListener = vi.fn();
    manager.on('loadingStateChanged', loadingStateChangedCb);

    manager.update(camera);
    vi.advanceTimersByTime(10000);

    expect(loadingStateChangedCb).toHaveBeenCalledTimes(0);
  });
});

/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { createRevealManager } from './createRevealManager';
import { RevealManager } from './RevealManager';

import { ModelDataProvider, ModelMetadataProvider } from '@reveal/modeldata-api';
import { SectorCuller } from '@reveal/cad-geometry-loaders';
import { SceneHandler } from '@reveal/utilities';
import {
  IAnnotationProvider,
  PointCloudObjectAnnotationData,
  LocalPointClassificationsProvider
} from '@reveal/pointclouds';
import { LoadingStateChangeListener } from './types';
import { It, Mock, SetPropertyExpression } from 'moq.ts';

describe('RevealManager', () => {
  const stubMetadataProvider: ModelMetadataProvider = {} as any;
  const stubDataProvider: ModelDataProvider = {} as any;
  const sectorCuller: SectorCuller = {
    determineSectors: jest.fn(),
    filterSectorsToLoad: jest.fn(),
    dispose: jest.fn()
  };
  const annotationProvider = new Mock<IAnnotationProvider>()
    .setup(p => p.getAnnotations(It.IsAny()))
    .returns(Promise.resolve(new PointCloudObjectAnnotationData([])))
    .object();
  const pointClassificationsProvider = new LocalPointClassificationsProvider();
  let manager: RevealManager;

  beforeEach(() => {
    jest.clearAllMocks();

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
      pointClassificationsProvider,
      rendererMock.object(),
      new SceneHandler(),
      {
        internal: { cad: { sectorCuller } }
      }
    );

    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('resetRedraw() resets needsRedraw', () => {
    manager.requestRedraw();
    expect(manager.needsRedraw).toBeTrue();
    manager.resetRedraw();
    expect(manager.needsRedraw).toBeFalse();
  });

  test('set clippingPlanes triggers redraw', () => {
    expect(manager.needsRedraw).toBeFalse();
    const planes = [new THREE.Plane(), new THREE.Plane()];
    manager.clippingPlanes = planes;
    expect(manager.needsRedraw).toBeTrue();
  });

  test('update only triggers update when camera changes', () => {
    manager.resetRedraw();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.5, 100);
    manager.update(camera);
    expect(manager.needsRedraw).toBeTrue(); // Changed

    manager.resetRedraw();
    manager.update(camera);
    expect(manager.needsRedraw).toBeFalse(); // Unhanged

    manager.resetRedraw();
    camera.position.set(1, 2, 3);
    manager.update(camera);
    expect(manager.needsRedraw).toBeTrue(); // Changed again
  });

  test('dispose() disposes culler', () => {
    manager.dispose();
    expect(sectorCuller.dispose).toBeCalled();
  });

  test('loadingStateChanged is not triggered if loading state doesnt change', () => {
    const camera = new THREE.PerspectiveCamera(60, 1, 0.5, 100);
    const loadingStateChangedCb: LoadingStateChangeListener = jest.fn();
    manager.on('loadingStateChanged', loadingStateChangedCb);

    manager.update(camera);
    jest.advanceTimersByTime(10000);

    expect(loadingStateChangedCb).toBeCalledTimes(0);
  });
});

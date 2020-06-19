/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { RevealManagerBase } from '@/public/RevealManagerBase';
import { MaterialManager } from '@/datamodels/cad/MaterialManager';
import { CadManager } from '@/datamodels/cad/CadManager';
import { PointCloudManager } from '@/datamodels/pointcloud/PointCloudManager';

describe('RevealManagerBase', () => {
  const mockCadManager: Omit<CadManager<number>, ''> = {
    addModel: jest.fn(),
    resetRedraw: jest.fn(),
    needsRedraw: false,
    updateCamera: jest.fn(),
    dispose: jest.fn(),
    clippingPlanes: [],
    clipIntersection: false
  };

  const cadManager = mockCadManager as CadManager<number>;

  const mockPointCloudManager: Omit<PointCloudManager<number>, ''> = {
    addModel: jest.fn(),
    needsRedraw: false,
    updateCamera: jest.fn(),
    getLoadingStateObserver: jest.fn()
  };
  const pointCloudManager = mockPointCloudManager as PointCloudManager<number>;
  const materialManager = new MaterialManager();
  const manager = new RevealManagerBase<number>(cadManager, materialManager, pointCloudManager);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('resetRedraw() calls CadManager.resetRedraw()', () => {
    const resetRedrawSpy = jest.spyOn(mockCadManager, 'resetRedraw');
    manager.resetRedraw();
    expect(resetRedrawSpy).toBeCalled();
  });

  test('set clippingPlanes, updates materials', () => {
    const planes = [new THREE.Plane(), new THREE.Plane()];
    const setClippingPlanesSpy = jest.spyOn(materialManager, 'clippingPlanes', 'set');
    manager.clippingPlanes = planes;
    expect(setClippingPlanesSpy).toBeCalled();
    expect(materialManager.clippingPlanes).toBe(planes);
    expect(mockCadManager.clippingPlanes).toBe(planes);
  });

  test('set clipIntersection, updates materials', () => {
    const setClipIntersectionSpy = jest.spyOn(materialManager, 'clipIntersection', 'set');
    manager.clipIntersection = true;
    expect(setClipIntersectionSpy).toBeCalled();
    expect(materialManager.clipIntersection).toBeTrue();
    expect(mockCadManager.clipIntersection).toBeTrue();
  });

  test('update only triggers update when camera changes', () => {
    const camera = new THREE.PerspectiveCamera(60, 1, 0.5, 100);
    const updateCameraSpy = jest.spyOn(mockCadManager, 'updateCamera');
    manager.update(camera);
    expect(updateCameraSpy).toBeCalledTimes(1); // Changed
    manager.update(camera);
    expect(updateCameraSpy).toBeCalledTimes(1); // Unchanged
    camera.position.set(1, 2, 3);
    manager.update(camera);
    expect(updateCameraSpy).toBeCalledTimes(2); // Changed again
    updateCameraSpy.mockClear();
  });
});

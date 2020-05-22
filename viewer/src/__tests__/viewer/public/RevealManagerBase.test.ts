/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { RevealManagerBase } from '@/public/RevealManagerBase';
import { MaterialManager } from '@/dataModels/cad/internal/MaterialManager';
import { CogniteClient } from '@cognite/sdk';
import { CadManager } from '@/dataModels/cad/internal/CadManager';

describe('RevealManagerBase', () => {
  const mockCadManager: Omit<CadManager<number>, ''> = {
    addModel: jest.fn(),
    resetRedraw: jest.fn(),
    needsRedraw: false,
    updateCamera: jest.fn()
  };

  const cadManager = mockCadManager as CadManager<number>;
  const client = new CogniteClient({ appId: 'test' });
  const materialManager = new MaterialManager();
  const manager = new RevealManagerBase<number>(client, cadManager, materialManager);

  test('update() calls CadManager.updateCamera()', () => {
    const camera = new THREE.PerspectiveCamera();
    const updateSpy = jest.spyOn(mockCadManager, 'updateCamera');
    manager.update(camera);
    expect(updateSpy).toBeCalled();
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
  });

  test('set clipIntersection, updates materials', () => {
    const setClipIntersectionSpy = jest.spyOn(materialManager, 'clipIntersection', 'set');
    manager.clipIntersection = true;
    expect(setClipIntersectionSpy).toBeCalled();
    expect(materialManager.clipIntersection).toBeTrue();
  });
});

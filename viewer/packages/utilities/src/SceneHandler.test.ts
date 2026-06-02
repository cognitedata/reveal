/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { SceneHandler } from '..';

import { createCadModel } from '../../../test-utilities';

import { vi } from 'vitest';

describe(SceneHandler.name, () => {
  test('Calling dispose correctly disposes all objects within the scene', () => {
    const box = new THREE.BoxGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial();
    const customObjectMesh = new THREE.Mesh(box, material);

    const disposeCustomObjectMeshGeometry = vi.spyOn(customObjectMesh.geometry, 'dispose');
    const disposeCustomObjectMeshMaterial = vi.spyOn(customObjectMesh.material, 'dispose');

    const cadModel = createCadModel(1, 1);
    const cadNodeMock = cadModel.cadNode;

    const sceneHandler = new SceneHandler();
    sceneHandler.addCadModel(cadNodeMock, Symbol('0'));
    sceneHandler.addObject3D(customObjectMesh);

    expect(sceneHandler.scene.children.length).toBe(2);

    sceneHandler.dispose();

    expect(disposeCustomObjectMeshGeometry).toHaveBeenCalled();
    expect(disposeCustomObjectMeshMaterial).toHaveBeenCalled();

    expect(sceneHandler.scene.children.length).toBe(0);
  });
});

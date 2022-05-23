/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { SceneHandler } from '..';

describe(SceneHandler.name, () => {
  test('Calling dispose correctly disposes all objects within the scene', () => {
    const box = new THREE.BoxGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial();
    const customObjectMesh = new THREE.Mesh(box, material);

    const disposeCustomObjectMeshGeometry = jest.spyOn(customObjectMesh.geometry, 'dispose');
    const disposeCustomObjectMeshMaterial = jest.spyOn(customObjectMesh.material, 'dispose');

    const model = new THREE.SphereGeometry(1, 2, 2);
    const modelMaterial = new THREE.MeshBasicMaterial();
    const modelMesh = new THREE.Mesh(model, modelMaterial);

    const disposeModelMeshGeometry = jest.spyOn(modelMesh.geometry, 'dispose');
    const disposeModelMeshMaterial = jest.spyOn(modelMesh.material, 'dispose');

    const sceneHandler = new SceneHandler();
    sceneHandler.addCadModel(modelMesh, '0');
    sceneHandler.addCustomObject(customObjectMesh);

    expect(sceneHandler.scene.children.length).toBe(2);

    sceneHandler.dispose();

    expect(disposeCustomObjectMeshGeometry).toBeCalled();
    expect(disposeCustomObjectMeshMaterial).toBeCalled();

    expect(disposeModelMeshGeometry).toBeCalled();
    expect(disposeModelMeshMaterial).toBeCalled();

    expect(sceneHandler.scene.children.length).toBe(0);
  });
});

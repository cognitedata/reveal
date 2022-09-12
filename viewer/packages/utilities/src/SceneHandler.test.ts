/*!
 * Copyright 2021 Cognite AS
 */
import { CadNode } from '@reveal/cad-model';
import * as THREE from 'three';
import { SceneHandler } from '..';

import { Mock } from 'moq.ts';

describe(SceneHandler.name, () => {
  test('Calling dispose correctly disposes all objects within the scene', () => {
    const box = new THREE.BoxGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial();
    const customObjectMesh = new THREE.Mesh(box, material);

    const disposeCustomObjectMeshGeometry = jest.spyOn(customObjectMesh.geometry, 'dispose');
    const disposeCustomObjectMeshMaterial = jest.spyOn(customObjectMesh.material, 'dispose');

    const cadNodeMock = new Mock<CadNode>().object();

    const disposeCadNode = jest.spyOn(cadNodeMock, 'dispose');

    const sceneHandler = new SceneHandler();
    sceneHandler.addCadModel(cadNodeMock, '0');
    sceneHandler.addCustomObject(customObjectMesh);

    expect(sceneHandler.scene.children.length).toBe(2);

    sceneHandler.dispose();

    expect(disposeCustomObjectMeshGeometry).toBeCalled();
    expect(disposeCustomObjectMeshMaterial).toBeCalled();

    expect(disposeCadNode).toBeCalled();

    expect(sceneHandler.scene.children.length).toBe(0);
  });
});

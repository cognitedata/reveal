/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

import { Image360Descriptor, Image360Face, Image360Provider } from '@reveal/data-providers';
import { Image360Entity } from '../src/entity/Image360Entity';
import { It, Mock } from 'moq.ts';
import { SceneHandler } from '@reveal/utilities';
import { Image360Icon } from '../src/entity/Image360Icon';

describe(Image360Entity.name, () => {
  test('transformation should be respected', () => {
    const image360Descriptor: Image360Descriptor = {
      id: '0',
      label: 'testEntity',
      collectionId: '0',
      collectionLabel: 'test_collection',
      transform: new THREE.Matrix4(),
      faceDescriptors: []
    };

    const mockSceneHandler = new Mock<SceneHandler>().setup(p => p.addCustomObject(It.IsAny())).returns();
    const mock360ImageProvider = new Mock<Image360Provider<any>>();
    const mock360ImageIcon = new Mock<Image360Icon>().object();

    const testTranslation = new THREE.Matrix4().makeTranslation(4, 5, 6);

    const entity = new Image360Entity(
      image360Descriptor,
      mockSceneHandler.object(),
      mock360ImageProvider.object(),
      testTranslation.clone(),
      mock360ImageIcon
    );

    expect(entity.transform.equals(testTranslation)).toBeTrue();
  });

  test('cache should reject loading image download if purged', async () => {
    const image360Descriptor: Image360Descriptor = {
      id: '0',
      label: 'testEntity',
      collectionId: '0',
      collectionLabel: 'test_collection',
      transform: new THREE.Matrix4(),
      faceDescriptors: []
    };

    const faces = new Array<Image360Face>();
    faces.push({ face: 'front', mimeType: 'image/jpeg', data: new ArrayBuffer(0) });
    faces.push({ face: 'back', mimeType: 'image/jpeg', data: new ArrayBuffer(0) });
    faces.push({ face: 'left', mimeType: 'image/jpeg', data: new ArrayBuffer(0) });
    faces.push({ face: 'right', mimeType: 'image/jpeg', data: new ArrayBuffer(0) });
    faces.push({ face: 'top', mimeType: 'image/jpeg', data: new ArrayBuffer(0) });
    faces.push({ face: 'bottom', mimeType: 'image/jpeg', data: new ArrayBuffer(0) });

    const mockSceneHandler = new Mock<SceneHandler>().setup(p => p.addCustomObject(It.IsAny())).returns();
    const mock360ImageProvider = new Mock<Image360Provider<any>>()
      .setup(p => p.get360ImageFiles(It.IsAny(), It.IsAny()))
      .returnsAsync(faces);

    const testTranslation = new THREE.Matrix4();
    const mock360ImageIcon = new Mock<Image360Icon>().object();

    const entity1 = new Image360Entity(
      image360Descriptor,
      mockSceneHandler.object(),
      mock360ImageProvider.object(),
      testTranslation.clone(),
      mock360ImageIcon
    );

    const entity2 = new Image360Entity(
      image360Descriptor,
      mockSceneHandler.object(),
      mock360ImageProvider.object(),
      testTranslation.clone(),
      mock360ImageIcon
    );

    const abortController = new AbortController();
    const abortedDownload = entity1.load360Image({ signal: abortController.signal });
    const validDownload = entity2.load360Image();

    abortController.abort();

    await expect(abortedDownload).rejects.toThrow();
    await expect(validDownload).resolves.not.toThrow();
  });
});

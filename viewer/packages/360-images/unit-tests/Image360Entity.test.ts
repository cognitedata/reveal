/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

import { Image360Descriptor, Image360Provider } from '@reveal/data-providers';
import { Image360Entity } from '../src/Image360Entity';
import { It, Mock } from 'moq.ts';
import { SceneHandler } from '@reveal/utilities';
import { Image360Icon } from '../src/Image360Icon';

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
});

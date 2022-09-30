/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

import { Image360Provider } from '@reveal/data-providers';
import { It, Mock } from 'moq.ts';
import { Image360EntityFactory } from '../src/Image360EntityFactory';
import { SceneHandler } from '@reveal/utilities';

describe(Image360EntityFactory.name, () => {
  test('Calling create should produce a valid image360Entity', async () => {
    const mock360ImageProvider = new Mock<Image360Provider<string>>();
    mock360ImageProvider
      .setup(p => p.get360ImageDescriptors(It.IsAny()))
      .returnsAsync([
        {
          id: '0',
          label: 'test_0',
          collectionId: '0',
          collectionLabel: 'testCollection',
          transform: new THREE.Matrix4()
        },
        {
          id: '1',
          label: 'test_1',
          collectionId: '0',
          collectionLabel: 'testCollection',
          transform: new THREE.Matrix4()
        },
        { id: '2', label: 'test_2', collectionId: '0', collectionLabel: 'testCollection', transform: new THREE.Matrix4() }
      ]);

    const mockSceneHandler = new Mock<SceneHandler>().setup(p => p.addCustomObject(It.IsAny())).returns();

    const image360EntityFactory = new Image360EntityFactory(mock360ImageProvider.object(), mockSceneHandler.object());
    const entities = await image360EntityFactory.create('someString');

    expect(entities.length).toBe(3);
  });
});

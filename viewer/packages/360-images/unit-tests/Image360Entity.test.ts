/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

import { Image360Descriptor, Image360Provider } from '@reveal/data-providers';
import { Image360Entity } from '../src/Image360Entity';
import { It, Mock } from 'moq.ts';
import { SceneHandler } from '@reveal/utilities';

describe(Image360Entity.name, () => {
  test('Each newly created Image360Entity should add a sprite to the scene', () => {
    const image360Descriptor: Image360Descriptor = {
      id: '0',
      label: 'testEntity',
      collectionId: '0',
      collectionLabel: 'test_collection',
      transform: new THREE.Matrix4()
    };

    const addedSprites: THREE.Sprite[] = [];
    const mockSceneHandler = new Mock<SceneHandler>()
      .setup(p => p.addCustomObject(It.IsAny()))
      .callback(({ args: [arg] }) => {
        addedSprites.push(arg as THREE.Sprite);
      });
    const mock360ImageProvider = new Mock<Image360Provider<any>>();

    new Image360Entity(image360Descriptor, mockSceneHandler.object(), mock360ImageProvider.object());
    new Image360Entity(image360Descriptor, mockSceneHandler.object(), mock360ImageProvider.object());
    new Image360Entity(image360Descriptor, mockSceneHandler.object(), mock360ImageProvider.object());

    expect(addedSprites.length).toBe(3);
    expect(addedSprites[0]).toBeDefined();
    expect(addedSprites[1]).toBeDefined();
    expect(addedSprites[2]).toBeDefined();
  });
});

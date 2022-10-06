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
      transformations: {
        translation: new THREE.Matrix4(),
        rotation: new THREE.Matrix4()
      }
    };

    const addedSprites: THREE.Sprite[] = [];
    const mockSceneHandler = new Mock<SceneHandler>()
      .setup(p => p.addCustomObject(It.IsAny()))
      .callback(({ args: [arg] }) => {
        addedSprites.push(arg as THREE.Sprite);
      });
    const mock360ImageProvider = new Mock<Image360Provider<any>>();

    new Image360Entity(
      image360Descriptor,
      mockSceneHandler.object(),
      mock360ImageProvider.object(),
      new THREE.Matrix4(),
      true
    );
    new Image360Entity(
      image360Descriptor,
      mockSceneHandler.object(),
      mock360ImageProvider.object(),
      new THREE.Matrix4(),
      true
    );
    new Image360Entity(
      image360Descriptor,
      mockSceneHandler.object(),
      mock360ImageProvider.object(),
      new THREE.Matrix4(),
      true
    );

    expect(addedSprites.length).toBe(3);
    expect(addedSprites[0]).toBeDefined();
    expect(addedSprites[1]).toBeDefined();
    expect(addedSprites[2]).toBeDefined();
  });

  test('pre-multiplied rotation should be respected', () => {
    const image360Descriptor: Image360Descriptor = {
      id: '0',
      label: 'testEntity',
      collectionId: '0',
      collectionLabel: 'test_collection',
      transformations: {
        translation: new THREE.Matrix4(),
        rotation: new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 2), 123)
      }
    };

    const mockSceneHandler = new Mock<SceneHandler>().setup(p => p.addCustomObject(It.IsAny())).returns();
    const mock360ImageProvider = new Mock<Image360Provider<any>>();

    const testTranslation = new THREE.Matrix4().makeTranslation(4, 5, 6);

    const preMultipliedEntity = new Image360Entity(
      image360Descriptor,
      mockSceneHandler.object(),
      mock360ImageProvider.object(),
      testTranslation.clone(),
      true
    );

    const expectedPreMultipliedTransform = testTranslation.clone().multiply(new THREE.Matrix4().makeRotationY(Math.PI));
    expect(preMultipliedEntity.transform.equals(expectedPreMultipliedTransform)).toBeTrue();

    const nonPreMultipliedEntity = new Image360Entity(
      image360Descriptor,
      mockSceneHandler.object(),
      mock360ImageProvider.object(),
      testTranslation.clone(),
      false
    );

    const expectedNonPreMultipliedTransform = testTranslation
      .clone()
      .multiply(
        image360Descriptor.transformations.rotation.clone().multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2))
      );
    expect(nonPreMultipliedEntity.transform.equals(expectedNonPreMultipliedTransform)).toBeTrue();
  });
});

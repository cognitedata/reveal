/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

import { Image360Provider } from '@reveal/data-providers';
import { It, Mock } from 'moq.ts';
import { BeforeSceneRenderedDelegate, DeviceDescriptor, EventTrigger, SceneHandler } from '@reveal/utilities';
import { Image360CollectionFactory } from '../src/collection/Image360CollectionFactory';

describe(Image360CollectionFactory.name, () => {
  test('Calling create should produce a valid image360Entity', async () => {
    const mock360ImageProvider = new Mock<Image360Provider<string>>();
    mock360ImageProvider
      .setup(p => p.get360ImageDescriptors(It.IsAny(), It.IsAny()))
      .returnsAsync([
        {
          id: '0',
          label: 'test_0',
          collectionId: '0',
          collectionLabel: 'testCollection',
          transform: new THREE.Matrix4(),
          imageRevisions: [
            {
              faceDescriptors: []
            }
          ]
        },
        {
          id: '1',
          label: 'test_1',
          collectionId: '0',
          collectionLabel: 'testCollection',
          transform: new THREE.Matrix4(),
          imageRevisions: [
            {
              faceDescriptors: []
            }
          ]
        },
        {
          id: '2',
          label: 'test_2',
          collectionId: '0',
          collectionLabel: 'testCollection',
          transform: new THREE.Matrix4(),
          imageRevisions: [
            {
              faceDescriptors: []
            }
          ]
        }
      ]);

    const mockSceneHandler = new Mock<SceneHandler>().setup(p => p.addObject3D(It.IsAny())).returns();
    const desktopDevice: DeviceDescriptor = { deviceType: 'desktop' };

    const image360EntityFactory = new Image360CollectionFactory(
      mock360ImageProvider.object(),
      mockSceneHandler.object(),
      new EventTrigger<BeforeSceneRenderedDelegate>(),
      () => {},
      desktopDevice,
      { platformMaxPointsSize: 256 }
    );
    const collection = await image360EntityFactory.create('someString', new THREE.Matrix4(), true, {});

    expect(collection.image360Entities.length).toBe(3);
  });
});

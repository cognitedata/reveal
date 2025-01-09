/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

import { ClassicDataSourceType, Image360Provider } from '@reveal/data-providers';
import { It, Mock } from 'moq.ts';
import { BeforeSceneRenderedDelegate, DeviceDescriptor, EventTrigger, SceneHandler } from '@reveal/utilities';
import { Image360CollectionFactory } from '../src/collection/Image360CollectionFactory';

describe(Image360CollectionFactory.name, () => {
  test('Calling create should produce a valid image360Entity', async () => {
    const mock360ImageProvider = new Mock<Image360Provider<ClassicDataSourceType>>();
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
              id: 'revision_0',
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
              id: 'revision_1',
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
              id: 'revision_2',
              faceDescriptors: []
            }
          ]
        }
      ]);

    const mockSceneHandler = new Mock<SceneHandler>().setup(p => p.addObject3D(It.IsAny())).returns();
    const desktopDevice: DeviceDescriptor = { deviceType: 'desktop' };

    const image360EntityFactory = new Image360CollectionFactory(
      new Map([['event', mock360ImageProvider.object()]]),
      mockSceneHandler.object(),
      new EventTrigger<BeforeSceneRenderedDelegate>(),
      () => {},
      desktopDevice,
      { platformMaxPointsSize: 256 }
    );
    const collection = await image360EntityFactory.create({ site_id: 'someString' }, new THREE.Matrix4(), true, {});

    expect(collection.image360Entities.length).toBe(3);
  });
});

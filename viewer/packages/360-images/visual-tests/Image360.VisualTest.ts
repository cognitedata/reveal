/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { Cdf360ImageEventProvider, Image360Provider } from '@reveal/data-providers';
import { StreamingTestFixtureComponents } from 'visual-tests/test-fixtures/StreamingVisualTestFixture';
import { StreamingVisualTestFixture } from '../../../visual-tests';
import { Image360EntityFactory } from '../src/Image360EntityFactory';
import { It, Mock } from 'moq.ts';

export default class Image360VisualTestFixture extends StreamingVisualTestFixture {
  public async setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { cogniteClient, sceneHandler, cameraControls } = testFixtureComponents;

    if (cogniteClient === undefined) {
      const image360Factory = new Image360EntityFactory(this.getMockImage360Provider().object(), sceneHandler);

      await Promise.all([
        image360Factory.create(new THREE.Vector3(5, 3, -10)),
        image360Factory.create(new THREE.Vector3(10, 3, -5)),
        image360Factory.create(new THREE.Vector3(10, 3, -10)),
        image360Factory.create(new THREE.Vector3(5, 3, -5))
      ]);
      return;
    }

    const cdf360ImageProvider = new Cdf360ImageEventProvider(cogniteClient);
    const image360Factory = new Image360EntityFactory(cdf360ImageProvider, sceneHandler);

    const rotation = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), 0.1);
    const translation = new THREE.Matrix4().makeTranslation(-18, 1, -13);
    const collectionTransform = translation.multiply(rotation);
    const image360Entities = await image360Factory.create(
      { site_id: '6th floor v3 - enterprise' },
      collectionTransform
    );
    image360Entities[40].activate360Image();
    const transform = image360Entities[40].transform.toArray();
    cameraControls.target.copy(new THREE.Vector3(transform[12], transform[13], transform[14]));
  }

  private getMockImage360Provider() {
    const mock360ImageProvider = new Mock<Image360Provider<THREE.Vector3>>();
    mock360ImageProvider
      .setup(p => p.get360ImageDescriptors(It.IsAny()))
      .callback(({ args: [arg] }) => {
        const translation = arg as THREE.Vector3;
        return Promise.resolve([
          {
            id: '0',
            name: 'test',
            collectionId: '0',
            collectionName: 'testCollection',
            transform: new THREE.Matrix4().makeTranslation(translation.x, translation.y, translation.z)
          }
        ]);
      });
    return mock360ImageProvider;
  }
}

/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { Cdf360ImageEventProvider, Image360Provider } from '@reveal/data-providers';
import { StreamingTestFixtureComponents } from 'visual-tests/test-fixtures/StreamingVisualTestFixture';
import { StreamingVisualTestFixture } from '../../../visual-tests';
import { Image360EntityFactory } from '../src/Image360EntityFactory';
import { It, Mock } from 'moq.ts';
import { Image360Facade } from '../src/Image360Facade';
import { SceneHandler } from '@reveal/utilities';
import { CogniteClient } from '@cognite/sdk';
import { Image360Entity } from '../src/Image360Entity';

export default class Image360VisualTestFixture extends StreamingVisualTestFixture {
  public async setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { cogniteClient, sceneHandler, cameraControls, renderer, camera } = testFixtureComponents;

    if (cogniteClient === undefined) {
      const image360Facade = await this.setupLocal(sceneHandler);

      const size = renderer.getDrawingBufferSize(new THREE.Vector2());

      renderer.domElement.addEventListener('mousemove', event => {
        image360Facade.intersect({ x: (event.x / size.x) * 2 - 1, y: ((event.y / size.y) * 2 - 1) * -1 }, camera);
        this.render();
      });

      return;
    }

    const { facade, entities } = await this.setupOfficeRobotics(sceneHandler, cogniteClient);
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());

    renderer.domElement.addEventListener('mousemove', event => {
      entities.forEach(p => (p.icon.hoverSpriteVisible = false));
      const entity = facade.intersect({ x: (event.x / size.x) * 2 - 1, y: ((event.y / size.y) * 2 - 1) * -1 }, camera);
      if (entity === undefined) {
        this.render();
        return;
      }
      entity.icon.hoverSpriteVisible = true;
      this.render();
    });

    renderer.domElement.addEventListener('click', event => {
      const entity = facade.intersect({ x: (event.x / size.x) * 2 - 1, y: ((event.y / size.y) * 2 - 1) * -1 }, camera);
      if (entity !== undefined) {
        entity.activate360Image();
        entity.icon.visible = false;
        // const transform = entity.transform.toArray();
        // cameraControls.target.copy(new THREE.Vector3(transform[12], transform[13], transform[14]));
      }
      this.render();
    });
  }

  private async setupOfficeRobotics(
    sceneHandler: SceneHandler,
    cogniteClient: CogniteClient
  ): Promise<{
    facade: Image360Facade<{
      [key: string]: string;
    }>;
    entities: Image360Entity[];
  }> {
    const cdf360ImageProvider = new Cdf360ImageEventProvider(cogniteClient);
    const image360Factory = new Image360EntityFactory(cdf360ImageProvider, sceneHandler);
    const image360Facade = new Image360Facade(image360Factory);
    const rotation = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), 0.1);
    const translation = new THREE.Matrix4().makeTranslation(-18, 1, -13);
    const collectionTransform = translation.multiply(rotation);
    const entities = await image360Facade.create({ site_id: '6th floor v3 - enterprise' }, collectionTransform);
    return { facade: image360Facade, entities };
  }

  private async setupLocal(sceneHandler: SceneHandler): Promise<Image360Facade<THREE.Vector3>> {
    const image360Factory = new Image360EntityFactory(this.getMockImage360Provider().object(), sceneHandler);
    const image360Facade = new Image360Facade(image360Factory);

    const entities = await Promise.all([
      image360Facade.create(new THREE.Vector3(5, 3, -10)),
      image360Facade.create(new THREE.Vector3(10, 3, -5)),
      image360Facade.create(new THREE.Vector3(10, 3, -10)),
      image360Facade.create(new THREE.Vector3(5, 3, -5))
    ]);

    entities[0][0].icon.visible = false;

    return image360Facade;
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
            label: 'test',
            collectionId: '0',
            collectionLabel: 'testCollection',
            transform: new THREE.Matrix4().makeTranslation(translation.x, translation.y, translation.z)
          }
        ]);
      });
    return mock360ImageProvider;
  }
}

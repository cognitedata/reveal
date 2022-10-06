/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { Cdf360ImageEventProvider, Image360Provider } from '@reveal/data-providers';
import { StreamingTestFixtureComponents } from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { StreamingVisualTestFixture } from '../../../visual-tests';
import { Image360EntityFactory } from '../src/Image360EntityFactory';
import { It, Mock } from 'moq.ts';
import { Image360Facade } from '../src/Image360Facade';
import { pixelToNormalizedDeviceCoordinates, SceneHandler } from '@reveal/utilities';
import { CogniteClient } from '@cognite/sdk';
import { Image360Entity } from '../src/Image360Entity';
import { degToRad } from 'three/src/math/MathUtils';

type CdfImage360Facade = Image360Facade<{
  [key: string]: string;
}>;

type LocalImage360Facade = Image360Facade<THREE.Vector3>;

export default class Image360VisualTestFixture extends StreamingVisualTestFixture {
  public async setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { cogniteClient, sceneHandler, cameraControls, renderer, camera } = testFixtureComponents;

    camera.near = 0.01;
    camera.updateProjectionMatrix();

    const { facade, entities } = await this.setup360Images(cogniteClient, sceneHandler);
    const size = new THREE.Vector2(renderer.domElement.clientWidth, renderer.domElement.clientHeight);

    const guiData = {
      opacity: 1.0
    };
    this.gui.add(guiData, 'opacity', 0, 1).onChange(() => {
      entities.forEach(entity => (entity.opacity = guiData.opacity));
      this.render();
    });

    renderer.domElement.addEventListener('mousemove', event => {
      entities.forEach(p => (p.icon.hoverSpriteVisible = false));
      const { x, y } = event;
      const { x: width, y: height } = size;
      const ndcCoordinates = pixelToNormalizedDeviceCoordinates(x, y, width, height);
      const entity = facade.intersect({ x: ndcCoordinates.x, y: ndcCoordinates.y }, camera);
      if (entity === undefined) {
        this.render();
        return;
      }
      entity.icon.hoverSpriteVisible = true;
      this.render();
    });

    renderer.domElement.addEventListener('click', event => {
      const { x, y } = event;
      const { x: width, y: height } = size;
      const ndcCoordinates = pixelToNormalizedDeviceCoordinates(x, y, width, height);
      const entity = facade.intersect({ x: ndcCoordinates.x, y: ndcCoordinates.y }, camera);
      if (entity !== undefined) {
        entity.activate360Image();
        entity.icon.visible = false;
        const transform = entity.transform.toArray();
        const image360Translation = new THREE.Vector3(transform[12], transform[13], transform[14]);
        camera.position.copy(image360Translation);
        cameraControls.target.copy(image360Translation.clone().add(new THREE.Vector3(0, 0, 0.001)));
      }
      this.render();
    });
  }

  private setup360Images(
    cogniteClient: CogniteClient | undefined,
    sceneHandler: SceneHandler
  ): Promise<{ facade: CdfImage360Facade | LocalImage360Facade; entities: Image360Entity[] }> {
    if (cogniteClient === undefined) {
      return this.setupLocal(sceneHandler);
    }

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if (
      urlParams.get('project') === 'twin-test' &&
      urlParams.get('modelId') === '946412141563897' &&
      urlParams.get('revisionId') === '6425532219434724'
    ) {
      return this.setupTwinTestMauiA(sceneHandler, cogniteClient);
    }

    if (
      urlParams.get('project') === 'officerobotics' &&
      urlParams.get('modelId') === '2755498691043825' &&
      urlParams.get('revisionId') === '141507501940626'
    ) {
      return this.setupOfficeRobotics(sceneHandler, cogniteClient);
    }

    return this.setupLocal(sceneHandler);
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
    const entities = await image360Facade.create({ site_id: '6th floor v3 - enterprise' }, collectionTransform, false);
    return { facade: image360Facade, entities };
  }

  private async setupTwinTestMauiA(
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

    const rotation = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), degToRad(177));
    const translation = new THREE.Matrix4().makeTranslation(11, 49, 32);
    const collectionTransform = translation.multiply(rotation);
    const entities = await image360Facade.create({ site_id: 'helideck-site-2' }, collectionTransform);

    const rotation2 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), degToRad(40));
    const translation2 = new THREE.Matrix4().makeTranslation(34, 30, 46);
    const collectionTransform2 = translation2.multiply(rotation2);
    const entities2 = await image360Facade.create({ site_id: 'j-tube-diesel-header-tank' }, collectionTransform2);

    const rotation3 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), degToRad(96));
    const translation3 = new THREE.Matrix4().makeTranslation(176, 37, 56);
    const collectionTransform3 = translation3.multiply(rotation3);
    const entities3 = await image360Facade.create({ site_id: 'se-stairs-module-5-boot-room' }, collectionTransform3);

    return { facade: image360Facade, entities: entities.concat(entities2, entities3) };
  }

  private async setupLocal(sceneHandler: SceneHandler): Promise<{
    facade: Image360Facade<any>;
    entities: Image360Entity[];
  }> {
    const image360Factory = new Image360EntityFactory(this.getMockImage360Provider().object(), sceneHandler);
    const image360Facade = new Image360Facade(image360Factory);

    const entities = (
      await Promise.all([
        image360Facade.create(new THREE.Vector3(5, 3, -10)),
        image360Facade.create(new THREE.Vector3(10, 3, -5)),
        image360Facade.create(new THREE.Vector3(10, 3, -10)),
        image360Facade.create(new THREE.Vector3(5, 3, -5))
      ])
    ).flatMap(p => p);

    entities[0].icon.visible = false;

    return { facade: image360Facade, entities };
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
            transformations: {
              translation: new THREE.Matrix4().makeTranslation(translation.x, translation.y, translation.z),
              rotation: new THREE.Matrix4()
            }
          }
        ]);
      });
    return mock360ImageProvider;
  }
}

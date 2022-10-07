/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { Cdf360ImageEventProvider, Local360ImageProvider } from '@reveal/data-providers';
import { StreamingTestFixtureComponents } from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { StreamingVisualTestFixture } from '../../../visual-tests';
import { Image360EntityFactory } from '../src/Image360EntityFactory';
import { Image360Facade } from '../src/Image360Facade';
import { pixelToNormalizedDeviceCoordinates, SceneHandler } from '@reveal/utilities';
import { CogniteClient } from '@cognite/sdk';
import { Image360Entity } from '../src/Image360Entity';
import { degToRad } from 'three/src/math/MathUtils';

type CdfImage360Facade = Image360Facade<{
  [key: string]: string;
}>;

type LocalImage360Facade = Image360Facade<unknown>;

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

    renderer.domElement.addEventListener('click', async event => {
      const { x, y } = event;
      const { x: width, y: height } = size;
      const ndcCoordinates = pixelToNormalizedDeviceCoordinates(x, y, width, height);
      const entity = facade.intersect({ x: ndcCoordinates.x, y: ndcCoordinates.y }, camera);
      if (entity !== undefined) {
        await entity.activate360Image();
        entity.icon.visible = false;
        const transform = entity.transform.toArray();
        const image360Translation = new THREE.Vector3(transform[12], transform[13], transform[14]);
        camera.position.copy(image360Translation);
        cameraControls.target.copy(image360Translation.clone().add(new THREE.Vector3(0, 0, 0.001)));
        cameraControls.update();
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
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const modelUrl = urlParams.get('modelUrl') ?? 'primitives';
    const dataProvider = new Local360ImageProvider(`${window.location.origin}/${modelUrl}`);
    const image360Factory = new Image360EntityFactory(dataProvider, sceneHandler);
    const image360Facade = new Image360Facade(image360Factory);

    const entities = await image360Facade.create({});

    return { facade: image360Facade, entities };
  }
}

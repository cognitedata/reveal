/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import {
  Cdf360DataModelsDescriptorProvider,
  Cdf360EventDescriptorProvider,
  Cdf360ImageProvider,
  ClassicDataSourceType,
  DataSourceType,
  GenericDataSourceType,
  Local360ImageProvider
} from '@reveal/data-providers';
import { StreamingTestFixtureComponents } from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';
import { StreamingVisualTestFixture } from '../../../visual-tests';
import { Image360Facade } from '../src/Image360Facade';
import {
  BeforeSceneRenderedDelegate,
  DeviceDescriptor,
  EventTrigger,
  getNormalizedPixelCoordinates,
  SceneHandler
} from '@reveal/utilities';
import { CogniteClient } from '@cognite/sdk';
import { Image360Entity } from '../src/entity/Image360Entity';
import TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Image360CollectionFactory } from '../src/collection/Image360CollectionFactory';
import { IconOctree } from '@reveal/3d-overlays';
import { OctreeHelper } from 'sparse-octree';
import { Overlay3DIcon } from '@reveal/3d-overlays';
import { DefaultImage360Collection } from '../src/collection/DefaultImage360Collection';

type CdfImage360Facade = Image360Facade<ClassicDataSourceType>;

type LocalImage360Facade = Image360Facade<GenericDataSourceType>;

export default class Image360VisualTestFixture extends StreamingVisualTestFixture {
  public async setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { cogniteClient, sceneHandler, cameraControls, renderer, camera, onBeforeRender } = testFixtureComponents;

    camera.near = 0.01;
    camera.updateProjectionMatrix();

    camera.position.set(22.67, 4.15, -2.89);
    camera.rotation.set(-0.4, 0.84, 0.3);

    const desktopDevice: DeviceDescriptor = { deviceType: 'desktop' };

    const { facade, collection } = await this.setup360Images(
      cogniteClient,
      sceneHandler,
      onBeforeRender,
      desktopDevice
    );
    collection.image360Entities[1].setIconColor(new THREE.Color(1.0, 0.0, 1.0));

    const collectionTransform = new THREE.Matrix4()
      .makeTranslation(10, -5, -7)
      .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 4));

    collection.setModelTransformation(collectionTransform);

    const icons = collection.image360Entities.map(entity => entity.icon);
    const octreeVisualizationObject = this.getOctreeVisualizationObject(icons);
    octreeVisualizationObject.applyMatrix4(collection.getModelTransformation());
    sceneHandler.addObject3D(octreeVisualizationObject);

    this.setupGUI(collection.image360Entities);

    this.setupMouseMoveEventHandler(renderer, facade, camera);

    this.setupMouseClickEventHandler(renderer, facade, camera, cameraControls);
  }

  private getOctreeVisualizationObject(icons: Overlay3DIcon[]) {
    const bounds = IconOctree.getMinimalOctreeBoundsFromIcons(icons);
    bounds.min.y = bounds.min.y - 0.5;
    bounds.max.y = bounds.max.y + 1;
    const iconOctree = new IconOctree(icons, bounds, 1);
    const octreeVisualization = new OctreeHelper(iconOctree);

    let seed = 70;
    octreeVisualization.traverse(obj => {
      if (obj instanceof THREE.LineSegments) {
        (obj.material as THREE.LineBasicMaterial).color = new THREE.Color(0xffffff * random(seed));
      }
      seed++;
    });

    return octreeVisualization;

    function random(seed: number) {
      seed = Math.sin(seed) * 10000;
      return seed - Math.floor(seed);
    }
  }

  private setupMouseClickEventHandler(
    renderer: THREE.WebGLRenderer,
    facade: CdfImage360Facade | LocalImage360Facade,
    camera: THREE.PerspectiveCamera,
    cameraControls: OrbitControls
  ) {
    let lastClicked: Image360Entity<DataSourceType> | undefined;
    renderer.domElement.addEventListener('click', async event => {
      const { x, y } = event;
      const ndcCoordinates = getNormalizedPixelCoordinates(renderer.domElement, x, y);
      const [_, entity] = facade.intersect(new THREE.Vector2(ndcCoordinates.x, ndcCoordinates.y), camera);

      if (entity === undefined) {
        this.render();
        return;
      }

      await facade.preload(entity, entity.getActiveRevision());
      entity.image360Visualization.visible = true;
      entity.icon.setVisible(false);

      if (lastClicked !== undefined) {
        this.transition360Image(lastClicked, entity, camera, cameraControls);
        lastClicked = entity;
        return;
      }

      const transform = entity.transform.toArray();
      const image360Translation = new THREE.Vector3(transform[12], transform[13], transform[14]);
      camera.position.copy(image360Translation);
      const cameraForward = camera.getWorldDirection(new THREE.Vector3());
      cameraControls.target.copy(image360Translation.clone().add(cameraForward.multiplyScalar(0.001)));
      cameraControls.update();
      lastClicked = entity;
      this.render();
    });
  }

  private transition360Image(
    lastClicked: Image360Entity<DataSourceType>,
    entity: Image360Entity<DataSourceType>,
    camera: THREE.PerspectiveCamera,
    cameraControls: OrbitControls
  ) {
    lastClicked.image360Visualization.renderOrder = 1;
    entity.image360Visualization.renderOrder = 0;

    const transformTo = entity.transform.toArray();
    const translationTo = new THREE.Vector3(transformTo[12], transformTo[13], transformTo[14]);

    const transformFrom = lastClicked.transform.toArray();
    const translationFrom = new THREE.Vector3(transformFrom[12], transformFrom[13], transformFrom[14]);

    const length = new THREE.Vector3().subVectors(translationTo, translationFrom).length();

    lastClicked.image360Visualization.scale = new THREE.Vector3(length * 2, length * 2, length * 2);
    entity.image360Visualization.scale = new THREE.Vector3(length * 2, length * 2, length * 2);

    const renderTrigger = setInterval(() => this.render(), 16);

    animateTransition();

    function animateTransition() {
      const from = { t: 0 };
      const to = { t: 1 };
      const tween = new TWEEN.Tween(from)
        .to(to, 1000)
        .onUpdate(() => {
          const animatedPosition = new THREE.Vector3().lerpVectors(translationFrom, translationTo, from.t);
          camera.position.copy(animatedPosition);
          lastClicked!.image360Visualization.opacity = 1 - from.t;
        })
        .easing(num => TWEEN.Easing.Quintic.InOut(num))
        .start(TWEEN.now());
      TWEEN.add(tween);

      tween.onComplete(() => {
        tween.stop();
        clearInterval(renderTrigger);
        camera.position.copy(translationTo);
        const cameraForward = camera.getWorldDirection(new THREE.Vector3());
        cameraControls.target.copy(translationTo.clone().add(cameraForward.multiplyScalar(0.001)));
        cameraControls.update();
        lastClicked = entity;
      });
    }
  }

  private setupMouseMoveEventHandler(
    renderer: THREE.WebGLRenderer,
    facade: CdfImage360Facade | LocalImage360Facade,
    camera: THREE.PerspectiveCamera
  ) {
    renderer.domElement.addEventListener('mousemove', async event => {
      const { x, y } = event;
      const ndcCoordinates = getNormalizedPixelCoordinates(renderer.domElement, x, y);
      const [_, entity] = facade.intersect(new THREE.Vector2(ndcCoordinates.x, ndcCoordinates.y), camera);
      if (entity === undefined) {
        this.render();
        return;
      }
      entity.icon.selected = true;
      await facade.preload(entity, entity.getActiveRevision());
      entity.image360Visualization.visible = false;
      this.render();
    });
  }

  private setupGUI(entities: Image360Entity<DataSourceType>[]) {
    const guiData = {
      opacity: 1.0
    };
    this.gui.add(guiData, 'opacity', 0, 1).onChange(() => {
      entities.forEach(entity => (entity.image360Visualization.opacity = guiData.opacity));
      this.render();
    });
  }

  private setup360Images(
    cogniteClient: CogniteClient | undefined,
    sceneHandler: SceneHandler,
    onBeforeRender: EventTrigger<BeforeSceneRenderedDelegate>,
    device: DeviceDescriptor
  ): Promise<{
    facade: CdfImage360Facade | LocalImage360Facade;
    collection: DefaultImage360Collection<DataSourceType>;
  }> {
    if (cogniteClient === undefined) {
      return this.setupLocal(sceneHandler, onBeforeRender, device);
    }

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const siteId = urlParams.get('siteId');
    const externalId = urlParams.get('externalId');
    const space = urlParams.get('space');

    if (externalId !== null && space !== null) {
      return getDM360ImageCollection(cogniteClient, externalId, space);
    }

    if (siteId !== null) {
      return getEvents360ImageCollection(cogniteClient, siteId);
    }

    return this.setupLocal(sceneHandler, onBeforeRender, device);

    async function getDM360ImageCollection(
      cogniteClient: CogniteClient,
      externalId: string,
      space: string
    ): Promise<{ facade: CdfImage360Facade; collection: DefaultImage360Collection<DataSourceType> }> {
      const cdf360EventDescriptorProvider = new Cdf360DataModelsDescriptorProvider(cogniteClient);
      const cdf360ImageProvider = new Cdf360ImageProvider(cogniteClient, cdf360EventDescriptorProvider);
      const image360Factory = new Image360CollectionFactory(
        cdf360ImageProvider,
        sceneHandler,
        onBeforeRender,
        () => {},
        device
      );
      const image360Facade = new Image360Facade(image360Factory);
      const collection = await image360Facade.create({ image360CollectionExternalId: externalId, space: space });

      return { facade: image360Facade, collection: collection };
    }

    async function getEvents360ImageCollection(
      cogniteClient: CogniteClient,
      siteId: string
    ): Promise<{ facade: CdfImage360Facade; collection: DefaultImage360Collection<DataSourceType> }> {
      const cdf360EventDescriptorProvider = new Cdf360EventDescriptorProvider(cogniteClient);
      const cdf360ImageProvider = new Cdf360ImageProvider(cogniteClient, cdf360EventDescriptorProvider);
      const image360Factory = new Image360CollectionFactory(
        cdf360ImageProvider,
        sceneHandler,
        onBeforeRender,
        () => {},
        device
      );
      const image360Facade = new Image360Facade(image360Factory);
      const collection = await image360Facade.create({ siteId: siteId });

      return { facade: image360Facade, collection: collection };
    }
  }

  private async setupLocal(
    sceneHandler: SceneHandler,
    onBeforeRender: EventTrigger<BeforeSceneRenderedDelegate>,
    device: DeviceDescriptor
  ): Promise<{
    facade: Image360Facade<any>;
    collection: DefaultImage360Collection<DataSourceType>;
  }> {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const modelUrl = urlParams.get('modelUrl') ?? 'primitives';
    const dataProvider = new Local360ImageProvider(`${window.location.origin}/${modelUrl}`);
    const image360Factory = new Image360CollectionFactory(dataProvider, sceneHandler, onBeforeRender, () => {}, device);
    const image360Facade = new Image360Facade(image360Factory);
    const collection = await image360Facade.create({});

    return { facade: image360Facade, collection };
  }
}

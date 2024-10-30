/*
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import {
  Cognite3DViewer,
  Image360,
  Image360Collection,
  Image360Annotation,
  Image360AnnotationIntersection,
  DataSourceType
} from '@cognite/reveal';

import * as dat from 'dat.gui';

export class Image360UI {
  private viewer: Cognite3DViewer<DataSourceType>;
  private gui: dat.GUI;
  private selectedEntity: Image360 | undefined;
  private _lastAnnotation: Image360Annotation | undefined = undefined;

  private async handleIntersectionAsync(intersectionPromise: Promise<Image360AnnotationIntersection | null>) {
    const intersection = await intersectionPromise;
    if (intersection === null) {
      return;
    }

    console.log('Clicked annotation with data: ', intersection.annotation.annotation.data);
    intersection.annotation.setColor(new THREE.Color(0.8, 0.8, 1.0));
    this.viewer.requestRedraw();
    this._lastAnnotation = intersection.annotation;
  }

  private params = {
    siteId: getSiteIdFromUrl() ?? '', // For instance: helideck-site-2-jpeg
    space: getSpaceFromUrl() ?? '',
    add: () => this.add360ImageSet(),
    remove: () => this.remove360ImageSet(),
    premultipliedRotation: false,
    removeAll: () => this.removeAll360Images(),
    saveToUrl: () => this.saveImage360SiteToUrl(),
    assetId: '',
    findAsset: () => this.findAsset()
  };

  private translation = {
    x: 0,
    y: 0,
    z: 0
  };

  private dataSource: { type: 'events' | 'dataModels' } = {
    type: getSpaceFromUrl() !== null && getSpaceFromUrl() !== '' ? 'dataModels' : 'events'
  };

  private rotation = {
    x: 0,
    y: 0,
    z: 0,
    radians: 0
  };

  private images360Settings = {
    opacity: 1
  };

  private icons360Setting = {
    visible: true,
    opacity: 1,
    occludedIconsVisible: true,
    radius: Infinity,
    limit: 50
  };

  private imageRevisions = {
    id: '0',
    targetDate: ''
  };

  constructor(viewer: Cognite3DViewer<DataSourceType>, gui: dat.GUI) {
    this.viewer = viewer;
    this.gui = gui;

    this.gui
      .add(this.dataSource, 'type', ['events', 'dataModels'])
      .name('Data source')
      .onChange((a: 'events' | 'dataModels') => {
        if (a === 'events') {
          optionsFolder.show();
          optionsFolderFdm.hide();
        } else {
          optionsFolder.hide();
          optionsFolderFdm.show();
        }
      });

    const optionsFolder = this.gui.addFolder('Add Options (Events)');
    const optionsFolderFdm = this.gui.addFolder('Add Options (Data Models)');
    optionsFolderFdm.hide();
    // events
    optionsFolder.add(this.params, 'siteId').name('Site ID');

    const translationGui = optionsFolder.addFolder('Translation');
    translationGui.add(this.translation, 'x').name('Translation X');
    translationGui.add(this.translation, 'y').name('Translation Y');
    translationGui.add(this.translation, 'z').name('Translation Z');

    const rotationGui = optionsFolder.addFolder('Rotation');
    rotationGui.add(this.rotation, 'x').name('Rotation Axis X');
    rotationGui.add(this.rotation, 'y').name('Rotation Axis Y');
    rotationGui.add(this.rotation, 'z').name('Rotation Axis Z');
    rotationGui.add(this.rotation, 'radians', 0, 2 * Math.PI, 0.001);

    optionsFolder.add(this.params, 'premultipliedRotation').name('Pre-multiplied rotation');

    // data models
    optionsFolderFdm.add(this.params, 'siteId').name('External ID');
    optionsFolderFdm.add(this.params, 'space').name('Space');

    this.gui.add(this.params, 'add').name('Add image set');
    this.gui.add(this.params, 'remove').name('Remove image set');

    gui.add(this.params, 'assetId').name('Asset ID');
    gui.add(this.params, 'findAsset').name('Find asset');

    this.gui
      .add(this.images360Settings, 'opacity', 0, 1, 0.01)
      .name('Image opacity')
      .onChange(() => {
        for (const collection of viewer.get360ImageCollections()) {
          collection.setImagesOpacity(this.images360Settings.opacity);
        }
      });

    this.gui
      .add(this.icons360Setting, 'visible')
      .name('Show all 360 images')
      .onChange(() => {
        for (const collection of viewer.get360ImageCollections()) {
          collection.setIconsVisibility(this.icons360Setting.visible);
        }
      });
    this.gui
      .add(this.icons360Setting, 'opacity', 0, 1, 0.01)
      .name('Icon opacity')
      .onChange(() => {
        for (const collection of viewer.get360ImageCollections()) {
          collection.setIconsOpacity(this.icons360Setting.opacity);
        }
      });
    this.gui
      .add(this.icons360Setting, 'occludedIconsVisible')
      .name('Set occluded icons visible')
      .onChange(() => {
        for (const collection of viewer.get360ImageCollections()) {
          collection.setOccludedIconsVisible(this.icons360Setting.occludedIconsVisible);
        }
      });
    this.gui
      .add(this.icons360Setting, 'radius', 0, 10000, 1)
      .name('Icon Culling radius')
      .onChange(() => {
        this.set360IconCullingRestrictions();
      });

    this.gui
      .add(this.icons360Setting, 'limit', 0, 10000, 1)
      .name('Icon Number of points')
      .onChange(() => {
        this.set360IconCullingRestrictions();
      });

    this.gui.add(this.params, 'saveToUrl').name('Save 360 site to URL');
    this.gui.add(this.params, 'removeAll').name('Remove all 360 images');

    gui
      .add(this.imageRevisions, 'targetDate')
      .name('Revision date (Unix epoch time):')
      .onChange(() => {
        const collections = this.viewer.get360ImageCollections();
        if (collections.length === 0) {
          return;
        }
        const date =
          this.imageRevisions.targetDate.length > 0 ? new Date(Number(this.imageRevisions.targetDate)) : undefined;
        collections.forEach(p => (p.targetRevisionDate = date));
        if (this.selectedEntity) viewer.enter360Image(this.selectedEntity);
      });

    gui
      .add(this.imageRevisions, 'id')
      .name('Current image revision')
      .onChange(() => {
        if (this.selectedEntity) {
          const revisions = this.selectedEntity.getRevisions();
          const index = Number(this.imageRevisions.id);
          if (index >= 0 && index < revisions.length) {
            viewer.enter360Image(this.selectedEntity, revisions[index]);
          }
        }
      });

    //restore image 360
    if (this.params.siteId.length > 0) {
      this.add360ImageSet();
    }
  }

  private remove360ImageSet() {
    if (this.params.siteId.length === 0) return;

    const collection = this.viewer.get360ImageCollections().find(c => c.id === this.params.siteId);

    if (collection === undefined) {
      return;
    }

    this.viewer.remove360ImageSet(collection);
  }

  private async add360ImageSet() {
    if (this.params.siteId.length === 0) return;

    const collection = await this.addCollection();

    collection.setIconsVisibility(this.icons360Setting.visible);
    collection.on('image360Entered', (entity, _) => {
      this.selectedEntity = entity;
    });
    this.viewer.on('click', event => this.onAnnotationClicked(event));
    this.viewer.requestRedraw();
  }

  private addCollection(): Promise<Image360Collection> {
    if (this.dataSource.type === 'dataModels') {
      return this.viewer.add360ImageSet('datamodels', {
        image360CollectionExternalId: this.params.siteId,
        space: this.params.space
      });
    }

    const rotationMatrix = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(this.rotation.x, this.rotation.y, this.rotation.z),
      this.rotation.radians
    );
    const translationMatrix = new THREE.Matrix4().makeTranslation(
      this.translation.x,
      this.translation.y,
      this.translation.z
    );
    const collectionTransform = translationMatrix.multiply(rotationMatrix);
    return this.viewer.add360ImageSet(
      'events',
      { site_id: this.params.siteId },
      {
        collectionTransform,
        preMultipliedRotation: this.params.premultipliedRotation,
        annotationFilter: { status: 'all' }
      }
    );
  }

  private async set360IconCullingRestrictions() {
    const collections = this.viewer.get360ImageCollections();
    if (collections.length === 0) {
      return;
    }
    collections.forEach(p => p.set360IconCullingRestrictions(this.icons360Setting.radius, this.icons360Setting.limit));
    this.viewer.requestRedraw();
  }

  private async removeAll360Images() {
    this.viewer.get360ImageCollections().forEach(p => this.viewer.remove360ImageSet(p));
  }

  private onAnnotationClicked(event: { offsetX: number; offsetY: number; button?: number }): void {
    if (this._lastAnnotation !== undefined) {
      this._lastAnnotation.setColor(undefined);
    }

    const intersectionPromise = this.viewer.get360AnnotationIntersectionFromPixel(event.offsetX, event.offsetY);

    this.handleIntersectionAsync(intersectionPromise);
  }

  private saveImage360SiteToUrl() {
    const { params } = this;
    if (params.siteId.length === 0) return;

    const url = new URL(window.location.href);
    url.searchParams.set('siteId', params.siteId);
    if (params.space.length > 0) {
      url.searchParams.set('space', params.space);
    }
    window.history.replaceState(null, document.title, url.toString());
  }

  async findAsset() {
    if (this.params.assetId.length === 0) {
      return;
    }
    const assetId = Number(this.params.assetId);
    const revisionsAndEntities = (
      await Promise.all(
        this.viewer
          .get360ImageCollections()
          .map(async collection => await collection.findImageAnnotations({ assetRef: { id: assetId } }))
      )
    ).flat(1);

    if (revisionsAndEntities.length === 0) {
      return;
    }

    const { image, revision, annotation } = revisionsAndEntities[0];

    await this.viewer.enter360Image(image, revision);
    this.viewer.cameraManager.setCameraState({ target: annotation.getCenter() });
  }
}

function getSiteIdFromUrl() {
  const url = new URL(window.location.href);
  const siteId = url.searchParams.get('siteId');
  return siteId;
}

function getSpaceFromUrl() {
  const url = new URL(window.location.href);
  const siteId = url.searchParams.get('space');
  return siteId;
}

/*
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import {
  Cognite3DViewer,
  Image360,
  Image360Collection,
  Image360Annotation,
  Image360AnnotationIntersection
} from '@cognite/reveal';

import * as dat from 'dat.gui';

export class Image360UI {
  private viewer: Cognite3DViewer;
  private gui: dat.GUI;
  private entities: Image360[] = [];
  private selectedEntity: Image360 | undefined;
  private _lastAnnotation: Image360Annotation | undefined = undefined;
  private _collections: Image360Collection[] = [];

  private async handleIntersectionAsync(intersectionPromise: Promise<Image360AnnotationIntersection | null>) {
    const intersection = await intersectionPromise;
    if (intersection === null) {
      return;
    }

    console.log('Clicked annotation with data: ', intersection.annotation.annotation.data);
    intersection.annotation.setColor(new THREE.Color(0.8, 0.8, 1.0));
    this._lastAnnotation = intersection.annotation;
  }

  get collections(): Image360Collection[] {
    return this._collections;
  }

  private params = {
    siteId: getSiteIdFromUrl() ?? '',
    add: () => this.add360ImageSet(),
    premultipliedRotation: false,
    remove: () => this.removeAll360Images(),
    saveToUrl: () => this.saveImage360SiteToUrl(),
    assetId: '',
    findAsset: () => this.findAsset()
  };

  private translation = {
    x: 0,
    y: 0,
    z: 0
  };

  private rotation = {
    x: 0,
    y: 0,
    z: 0,
    radians: 0
  };

  private opacity = {
    alpha: 1
  };

  private iconCulling = {
    radius: Infinity,
    limit: 50,
    hideAll: false
  };

  private imageRevisions = {
    id: '0',
    targetDate: ''
  };

  constructor(viewer: Cognite3DViewer, gui: dat.GUI) {
    const { params, imageRevisions, _collections: collections, selectedEntity } = this;
    this.viewer = viewer;
    this.gui = gui;

    const optionsFolder = this.gui.addFolder('Add Options');

    optionsFolder.add(params, 'siteId').name('Site ID');

    const translationGui = optionsFolder.addFolder('Translation');
    translationGui.add(this.translation, 'x').name('Translation X');
    translationGui.add(this.translation, 'y').name('Translation Y');
    translationGui.add(this.translation, 'z').name('Translation Z');

    const rotationGui = optionsFolder.addFolder('Rotation');
    rotationGui.add(this.rotation, 'x').name('Rotation Axis X');
    rotationGui.add(this.rotation, 'y').name('Rotation Axis Y');
    rotationGui.add(this.rotation, 'z').name('Rotation Axis Z');
    rotationGui.add(this.rotation, 'radians', 0, 2 * Math.PI, 0.001);

    optionsFolder.add(params, 'premultipliedRotation').name('Pre-multiplied rotation');

    this.gui.add(params, 'add').name('Add image set');

    this.gui.add(this.opacity, 'alpha', 0, 1, 0.01).onChange(() => {
      this.entities.forEach(p => (p.image360Visualization.opacity = this.opacity.alpha));
      this.viewer.requestRedraw();
    });

    gui.add(params, 'assetId').name('Asset ID');
    gui.add(params, 'findAsset').name('Find asset');

    this.gui
      .add(this.iconCulling, 'radius', 0, 10000, 1)
      .name('Culling radius')
      .onChange(() => {
        this.set360IconCullingRestrictions();
      });

    this.gui
      .add(this.iconCulling, 'limit', 0, 10000, 1)
      .name('Number of points')
      .onChange(() => {
        this.set360IconCullingRestrictions();
      });

    this.gui
      .add(this.iconCulling, 'hideAll')
      .name('Hide all 360 images')
      .onChange(() => {
        if (this._collections.length > 0) {
          this._collections.forEach(p => p.setIconsVisibility(!this.iconCulling.hideAll));
          this.viewer.requestRedraw();
        }
      });

    this.gui.add(params, 'saveToUrl').name('Save 360 site to URL');
    this.gui.add(params, 'remove').name('Remove all 360 images');

    //restore image 360
    if (params.siteId.length > 0) {
      this.add360ImageSet();
      gui
        .add(imageRevisions, 'targetDate')
        .name('Revision date (Unix epoch time):')
        .onChange(() => {
          if (collections.length === 0) return;

          const date = imageRevisions.targetDate.length > 0 ? new Date(Number(imageRevisions.targetDate)) : undefined;
          collections.forEach(p => (p.targetRevisionDate = date));
          if (selectedEntity) viewer.enter360Image(selectedEntity);
        });

      gui
        .add(imageRevisions, 'id')
        .name('Current image revision')
        .onChange(() => {
          if (selectedEntity) {
            const revisions = selectedEntity.getRevisions();
            const index = Number(imageRevisions.id);
            if (index >= 0 && index < revisions.length) {
              viewer.enter360Image(selectedEntity, revisions[index]);
            }
          }
        });

      gui.add(params, 'remove').name('Remove all 360 images');
    }
  }

  private async add360ImageSet() {
    const { params, _collections: collections } = this;

    if (params.siteId.length === 0) return;

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
    const collection = await this.viewer.add360ImageSet(
      'events',
      { site_id: params.siteId },
      {
        collectionTransform,
        preMultipliedRotation: params.premultipliedRotation,
        annotationFilter: { status: 'all' }
      }
    );

    collection.setIconsVisibility(!this.iconCulling.hideAll);
    collection.on('image360Entered', (entity, _) => (this.selectedEntity = entity));
    this.viewer.on('click', event => this.onAnnotationClicked(event));
    collections.push(collection);
    this.entities = this.entities.concat(collection.image360Entities);

    this.viewer.requestRedraw();
  }

  private async set360IconCullingRestrictions() {
    if (this._collections.length > 0) {
      this._collections.forEach(p => p.set360IconCullingRestrictions(this.iconCulling.radius, this.iconCulling.limit));
      this.viewer.requestRedraw();
    }
  }

  private async removeAll360Images() {
    await this.viewer.remove360Images(...this.entities);
    this.entities = [];
    this._collections = [];
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
    window.history.replaceState(null, document.title, url.toString());
  }

  async findAsset() {
    if (this.params.assetId.length === 0) {
      return;
    }

    const assetId = Number(this.params.assetId);

    const revisionsAndEntities = (
      await Promise.all(
        this.collections.map(async coll => await coll.findImageAnnotations({ assetRef: { id: assetId } }))
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

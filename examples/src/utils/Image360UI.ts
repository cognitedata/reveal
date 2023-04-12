/*
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { Cognite3DViewer, Image360, Image360Collection } from '@cognite/reveal';
import * as dat from 'dat.gui';

export class Image360UI {
  private viewer: Cognite3DViewer;
  private gui: dat.GUI;
  private entities: Image360[] = [];
  private collections: Image360Collection[] = [];

  private params = {
    siteId: this.getSideIdFromUrl() ?? '',
    add: this.add360ImageSet.bind(this),
    premultipliedRotation: false,
    remove: this.removeAll360Images.bind(this),
    saveToUrl: this.saveImage360SiteToUrl.bind(this),
  };

  private translation = {
    x: 0,
    y: 0,
    z: 0,
  };

  private rotation = {
    x: 0,
    y: 0,
    z: 0,
    radians: 0,
  };

  private opacity = {
    alpha: 1,
  };

  private iconCulling = {
    radius: Infinity,
    limit: 50,
    hideAll: false,
  };

  constructor(viewer: Cognite3DViewer, gui: dat.GUI) {
    const { params } = this;
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

    this.gui
      .add(this.opacity, 'alpha', 0, 1, 0.01)
      .onChange(() => {
        this.entities.forEach((p) => (p.image360Visualization.opacity = this.opacity.alpha));
        this.viewer.requestRedraw();
      });

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
        if (this.collections.length > 0) {
          this.collections.forEach((p) => p.setIconsVisibility(!this.iconCulling.hideAll));
          this.viewer.requestRedraw();
        }
      });

    this.gui.add(params, 'saveToUrl').name('Save 360 site to URL');
    this.gui.add(params, 'remove').name('Remove all 360 images');

    //restore image 360
    if (params.siteId.length > 0) {
      this.add360ImageSet();
    }
  }

  private async add360ImageSet() {
   const { params } = this;

    if (params.siteId.length === 0) return;

    const rotationMatrix = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(this.rotation.x, this.rotation.y, this.rotation.z),
      this.rotation.radians
    );
    const translationMatrix = new THREE.Matrix4().makeTranslation(this.translation.x, this.translation.y, this.translation.z);
    const collectionTransform = translationMatrix.multiply(rotationMatrix);
    const collection = await this.viewer.add360ImageSet(
      'events',
      { site_id: params.siteId },
      { collectionTransform, preMultipliedRotation: params.premultipliedRotation }
    );
    collection.setIconsVisibility(!this.iconCulling.hideAll);
    this.collections.push(collection);
    this.entities = this.entities.concat(collection.image360Entities);
    this.viewer.requestRedraw();
  }

  private async set360IconCullingRestrictions() {
    if (this.collections.length > 0) {
      this.collections.forEach((p) => p.set360IconCullingRestrictions(this.iconCulling.radius, this.iconCulling.limit));
      this.viewer.requestRedraw();
    }
  }

  private async removeAll360Images() {
    await this.viewer.remove360Images(...this.entities);
    this.entities = [];
    this.collections = [];
  }

  private getSideIdFromUrl() {
    const url = new URL(window.location.href);
    const siteId = url.searchParams.get('siteId');
    return siteId;
  }

  private saveImage360SiteToUrl() {
    const { params } = this;
    if (params.siteId.length === 0) return;

    const url = new URL(window.location.href);
    url.searchParams.set('siteId', params.siteId);
    window.history.replaceState(null, document.title, url.toString());
  }
}

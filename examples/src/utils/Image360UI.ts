/*
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { Cognite3DViewer, Image360, Image360Collection, Image360EnteredDelegate } from '@cognite/reveal';
import * as dat from 'dat.gui';

export class Image360UI {
  constructor(viewer: Cognite3DViewer, gui: dat.GUI) {
    let entities: Image360[] = [];
    let collections: Image360Collection[] = [];
    let selectedEntity: Image360;

    const optionsFolder = gui.addFolder('Add Options');

    const onImageEntered: Image360EnteredDelegate = entity => {
      selectedEntity = entity;
      // --- Remove after testing - Start
      console.log('Current revision: ' + selectedEntity.getActiveRevision().date);

      const revisions = selectedEntity.list360ImageRevisions();
      if (revisions.length > 0) {
        console.log('Available revisions:');
        revisions.forEach((revision, index) => console.log('- Id ' + index + ', ' + revision.date));
      }
      // --- Remove after testing - End
    };

    const translation = {
      x: 0,
      y: 0,
      z: 0
    };

    const rotation = {
      x: 0,
      y: 0,
      z: 0,
      radians: 0
    };

    const opacity = {
      alpha: 1
    };

    const iconCulling = {
      radius: Infinity,
      limit: 50,
      hideAll: false
    };

    const imageRevisions = {
      id: '0',
      targetDate: ''
    };

    const params = {
      siteId: '',
      add: add360ImageSet,
      premultipliedRotation: false,
      remove: removeAll360Images
    };

    optionsFolder.add(params, 'siteId').name('Site ID');

    const translationGui = optionsFolder.addFolder('Translation');
    translationGui.add(translation, 'x').name('Translation X');
    translationGui.add(translation, 'y').name('Translation Y');
    translationGui.add(translation, 'z').name('Translation Z');

    const rotationGui = optionsFolder.addFolder('Rotation');
    rotationGui.add(rotation, 'x').name('Rotation Axis X');
    rotationGui.add(rotation, 'y').name('Rotation Axis Y');
    rotationGui.add(rotation, 'z').name('Rotation Axis Z');
    rotationGui.add(rotation, 'radians', 0, 2 * Math.PI, 0.001);

    optionsFolder.add(params, 'premultipliedRotation').name('Pre-multiplied rotation');

    gui.add(params, 'add').name('Add image set');

    gui.add(opacity, 'alpha', 0, 1, 0.01).onChange(() => {
      entities.forEach(p => p.setOpacity(opacity.alpha));
      viewer.requestRedraw();
    });

    gui
      .add(iconCulling, 'radius', 0, 10000, 1)
      .name('Culling radius')
      .onChange(() => {
        set360IconCullingRestrictions();
      });

    gui
      .add(iconCulling, 'limit', 0, 10000, 1)
      .name('Number of points')
      .onChange(() => {
        set360IconCullingRestrictions();
      });

    gui
      .add(iconCulling, 'hideAll')
      .name('Hide all 360 images')
      .onChange(() => {
        if (collections.length > 0) {
          collections.forEach(p => p.setIconsVisibility(!iconCulling.hideAll));
          viewer.requestRedraw();
        }
      });

    gui
      .add(imageRevisions, 'targetDate')
      .name('Revision date (Unix epoch time):')
      .onChange(() => {
        if (collections.length > 0) {
          const date = imageRevisions.targetDate.length > 0 ? new Date(Number(imageRevisions.targetDate)) : undefined;
          collections.forEach(p => (p.targetRevisionDate = date));

          if (selectedEntity) {
            viewer.enter360Image(selectedEntity);
          }
        }
      });

    gui
      .add(imageRevisions, 'id')
      .name('Current image revision')
      .onChange(() => {
        if (selectedEntity) {
          const revisions = selectedEntity.list360ImageRevisions();
          const index = Number(imageRevisions.id);
          if (index >= 0 && index < revisions.length) {
            selectedEntity.changeRevision(revisions[index]).catch(e => {
              console.warn(e);
            });
          }
        }
      });

    gui.add(params, 'remove').name('Remove all 360 images');

    async function add360ImageSet() {
      if (params.siteId.length === 0) return;

      const rotationMatrix = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(rotation.x, rotation.y, rotation.z),
        rotation.radians
      );
      const translationMatrix = new THREE.Matrix4().makeTranslation(translation.x, translation.y, translation.z);
      const collectionTransform = translationMatrix.multiply(rotationMatrix);
      const collection = await viewer.add360ImageSet(
        'events',
        { site_id: params.siteId },
        { collectionTransform, preMultipliedRotation: params.premultipliedRotation }
      );
      collection.setIconsVisibility(!iconCulling.hideAll);
      collection.on('image360Entered', onImageEntered);
      collections.push(collection);
      entities = entities.concat(collection.image360Entities);
      viewer.requestRedraw();
    }

    async function set360IconCullingRestrictions() {
      if (collections.length > 0) {
        collections.forEach(p => p.set360IconCullingRestrictions(iconCulling.radius, iconCulling.limit));
        viewer.requestRedraw();
      }
    }

    async function removeAll360Images() {
      await viewer.remove360Images(...entities);
      entities = [];
      collections = [];
    }
  }
}

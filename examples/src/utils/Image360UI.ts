/*
 * Copyright 2021 Cognite AS
 */

import { Cognite3DViewer, Image360Entity, THREE } from "@cognite/reveal";
import * as dat from 'dat.gui';

export class Image360UI {
  constructor(private viewer: Cognite3DViewer, private gui: dat.GUI){
    let entities: Image360Entity[] = [];
    
    const optionsFolder = gui.addFolder('Add Options');

    const translation = {
      x: 11,
      y: 49,
      z: 32
    };
    
    const rotation = {
      x: 0,
      y: 1,
      z: 0,
      radians: 3.08923
    };

    const opacity = {
      alpha: 1
    };
    
    const params = {
      siteId: 'helideck-site-2',
      add: add360ImageSet,
      premultipliedRotation: true
    };

    add360ImageSet();

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
      entities.forEach(p => (p.opacity = opacity.alpha));
      viewer.requestRedraw();
    });

    async function add360ImageSet(){
      const rotationMatrix = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(rotation.x, rotation.y, rotation.z), rotation.radians);
      const translationMatrix = new THREE.Matrix4().makeTranslation(translation.x, translation.y, translation.z);
      const collectionTransform = translationMatrix.multiply(rotationMatrix);
      const set = await viewer.add360ImageSet('events', {site_id: params.siteId}, {collectionTransform, preMultipliedRotation: params.premultipliedRotation});
      entities = entities.concat(set);
      viewer.requestRedraw();
    }
  }

}
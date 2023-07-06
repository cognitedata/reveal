/*
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { Cognite3DViewer, CogniteCadModel, NumericRange } from '@cognite/reveal';

import * as dat from 'dat.gui';

export class NodeTransformUI {
  private viewer: Cognite3DViewer;
  private gui: dat.GUI;
  private model: CogniteCadModel;

  private translation = {
    x: 0,
    y: 0,
    z: 0
  };

  private rotation = {
    x: 0,
    y: 0,
    z: 0
  };

  private range = {
    from: 0,
    count: 0
  };

  private actions = {
    apply: () => this.apply()
  };

  constructor(viewer: Cognite3DViewer, gui: dat.GUI, model: CogniteCadModel) {
    this.viewer = viewer;
    this.gui = gui;
    this.model = model;

    const translationGui = gui.addFolder('Translation');
    translationGui.open();
    translationGui.add(this.translation, 'x').name('Translation X');
    translationGui.add(this.translation, 'y').name('Translation Y');
    translationGui.add(this.translation, 'z').name('Translation Z');

    const rotationGui = gui.addFolder('Rotation (degrees)');
    rotationGui.open();
    rotationGui.add(this.rotation, 'x').name('X-axis');
    rotationGui.add(this.rotation, 'y').name('Y-axis');
    rotationGui.add(this.rotation, 'z').name('Z-axis');

    gui.add(this.range, 'from', 0, this.model.nodeCount, 1).name('First tree index');
    gui.add(this.range, 'count', 1, this.model.nodeCount, 1).name('Node count');
    gui.add(this.actions, 'apply').name('Apply');
  }

  apply() {
    const translation = new THREE.Matrix4().makeTranslation(this.translation.x, this.translation.y, this.translation.z);
    const rotation = new THREE.Matrix4().makeRotationFromEuler(
      new THREE.Euler(
        (this.rotation.x * Math.PI) / 180,
        (this.rotation.y * Math.PI) / 180,
        (this.rotation.z * Math.PI) / 180
      )
    );

    const matrix = new THREE.Matrix4().multiplyMatrices(translation, rotation);
    this.model.setNodeTransform(new NumericRange(this.range.from, this.range.count), matrix);
  }
}

/*
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { CadIntersection, Cognite3DViewer, CogniteCadModel, NumericRange } from '@cognite/reveal';

import * as dat from 'dat.gui';
import { TransformControls } from 'three-stdlib';

export class NodeTransformUI {
  private viewer: Cognite3DViewer;
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

  private attachTransformControls = {
    attach: true
  };

  constructor(viewer: Cognite3DViewer, gui: dat.GUI, model: CogniteCadModel) {
    this.viewer = viewer;
    this.model = model;

    const transformControls = new TransformControls(this.viewer.cameraManager.getCamera(), this.viewer.domElement);
    transformControls.setMode('scale');
    viewer.addObject3D(transformControls);

    viewer.on('click', async ({ offsetX, offsetY }) => {
      const intersection = await viewer.getIntersectionFromPixel(offsetX, offsetY);

      if (intersection === null) {
        return;
      }

      const treeIndex: number | undefined = (intersection as CadIntersection)?.treeIndex;

      if (treeIndex === undefined) {
        return;
      }

      model.getBoundingBoxByTreeIndex(treeIndex).then(boundingBox => {
        const boxMesh = new THREE.Object3D();
        transformControls.attach(boxMesh);
        viewer.addObject3D(boxMesh);

        const center = boundingBox.getCenter(new THREE.Vector3());

        const modelToWorld = new THREE.Matrix4();
        const worldToModel = new THREE.Matrix4();

        modelToWorld.setPosition(center);
        worldToModel.copy(modelToWorld.clone().invert());

        transformControls.addEventListener('dragging-changed', event => {
          if (event.value) {
            viewer.cameraManager.deactivate();
          } else {
            viewer.cameraManager.activate();
          }
        });

        transformControls.addEventListener('change', event => {
          const matrixOverride = modelToWorld.clone().multiply(boxMesh.matrix.clone().multiply(worldToModel));
          model.setNodeTransform(new NumericRange(treeIndex, 1), matrixOverride, undefined, 'world');
          viewer.requestRedraw();
        });
      });
    });

    const nodeTransformGui = gui.addFolder('Manuel node transform');
    const translationGui = nodeTransformGui.addFolder('Translation');
    translationGui.open();
    translationGui.add(this.translation, 'x').name('Translation X');
    translationGui.add(this.translation, 'y').name('Translation Y');
    translationGui.add(this.translation, 'z').name('Translation Z');

    const rotationGui = nodeTransformGui.addFolder('Rotation (degrees)');
    rotationGui.open();
    rotationGui.add(this.rotation, 'x').name('X-axis');
    rotationGui.add(this.rotation, 'y').name('Y-axis');
    rotationGui.add(this.rotation, 'z').name('Z-axis');

    nodeTransformGui.add(this.range, 'from', 0, this.model.nodeCount, 1).name('First tree index');
    nodeTransformGui.add(this.range, 'count', 1, this.model.nodeCount, 1).name('Node count');
    nodeTransformGui.add(this.actions, 'apply').name('Apply');

    const toolTransform = gui.addFolder('Tool node transform');
    toolTransform.add(this.attachTransformControls, 'attach').name('Attach transform controls');
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
    this.model.setNodeTransform(new NumericRange(this.range.from, this.range.count), matrix, undefined, 'world');
  }
}

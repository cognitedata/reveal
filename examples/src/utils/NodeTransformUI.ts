/*
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { CadIntersection, Cognite3DViewer, CogniteCadModel, DataSourceType, NumericRange } from '@cognite/reveal';

import * as dat from 'dat.gui';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export class NodeTransformUI {
  private viewer: Cognite3DViewer<DataSourceType>;
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
    attach: false,
    mode: 'translate' as const
  };

  private _transformControls: TransformControls | undefined;

  constructor(viewer: Cognite3DViewer<DataSourceType>, gui: dat.GUI, model: CogniteCadModel) {
    this.viewer = viewer;
    this.model = model;

    viewer.on('click', this._onNodeClick);

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
    toolTransform
      .add(this.attachTransformControls, 'mode', ['translate', 'rotate'] as const)
      .onChange(() => this._transformControls?.setMode(this.attachTransformControls.mode));
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

  createAndSetupTransformTool(viewer: Cognite3DViewer<DataSourceType>, model: CogniteCadModel): TransformControls {
    const transformControls = new TransformControls(viewer.cameraManager.getCamera(), viewer.domElement);
    transformControls.setMode(this.attachTransformControls.mode);
    viewer.addObject3D(transformControls.getHelper());
    return transformControls;
  }

  private _onNodeClick = async ({ offsetX, offsetY }: { offsetX: number; offsetY: number }) => {
    if (!this.attachTransformControls.attach) {
      this._transformControls?.detach();
      return;
    }
    const intersection = await this.viewer.getIntersectionFromPixel(offsetX, offsetY);

    const treeIndex: number | undefined = (intersection as CadIntersection)?.treeIndex;

    if (intersection === null || treeIndex === undefined) {
      this._transformControls?.detach();
      return;
    }

    const transformControls = this._transformControls ?? this.createAndSetupTransformTool(this.viewer, this.model);
    this._transformControls = transformControls;

    const boundingBox = await this.model.getBoundingBoxByTreeIndex(treeIndex);
    const boxMesh = new THREE.Object3D();
    transformControls.attach(boxMesh);
    this.viewer.addObject3D(boxMesh);

    const center = boundingBox.getCenter(new THREE.Vector3());
    boxMesh.position.copy(center);

    const modelToWorld = new THREE.Matrix4();
    const worldToModel = new THREE.Matrix4();

    modelToWorld.setPosition(center);
    worldToModel.copy(modelToWorld.clone().invert());

    transformControls.addEventListener('dragging-changed', event => {
      if (event.value) {
        this.viewer.cameraManager.deactivate();
      } else {
        this.viewer.cameraManager.activate();
      }
    });

    transformControls.addEventListener('change', event => {
      const matrixOverride = boxMesh.matrix.clone().multiply(worldToModel);
      this.model.setNodeTransform(new NumericRange(treeIndex, 1), matrixOverride, undefined, 'world');
      this.viewer.requestRedraw();
    });
  };
}

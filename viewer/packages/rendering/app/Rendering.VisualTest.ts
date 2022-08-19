/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

import {
  StreamingVisualTestFixture,
  StreamingTestFixtureComponents
} from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';

export default class RenderingVisualTestFixture extends StreamingVisualTestFixture {
  public setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { sceneHandler, model, camera, renderer } = testFixtureComponents;

    const grid = this.getGridFromBoundingBox(model.boundingBox);
    sceneHandler.addCustomObject(grid);

    const customBox = this.getCustomBoxFromBoundingBox(model.boundingBox);
    sceneHandler.addCustomObject(customBox);

    const transformControls = this.attachTransformControlsTo(customBox, camera, renderer.domElement);
    sceneHandler.addCustomObject(transformControls);

    return Promise.resolve();
  }

  private getGridFromBoundingBox(boundingBox: THREE.Box3): THREE.GridHelper {
    const gridSize = new THREE.Vector2(boundingBox.max.x - boundingBox.min.x, boundingBox.max.z - boundingBox.min.z);
    const grid = new THREE.GridHelper(gridSize.x, 20); //THIS IS WRONG
    grid.position.copy(boundingBox.getCenter(new THREE.Vector3()));
    grid.position.setY(boundingBox.min.y);

    return grid;
  }

  private getCustomBoxFromBoundingBox(boundingBox: THREE.Box3): THREE.Mesh {
    const customBox = new THREE.Mesh(
      new THREE.BoxGeometry(10, 10, 30),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(1, 0, 0),
        transparent: true,
        opacity: 0.5,
        depthTest: false
      })
    );

    const boxCenter = boundingBox.getCenter(new THREE.Vector3());
    customBox.position.copy(boxCenter);

    return customBox;
  }

  private attachTransformControlsTo(
    object: THREE.Object3D,
    camera: THREE.PerspectiveCamera,
    canvas: HTMLCanvasElement
  ) {
    const transformControls = new TransformControls(camera, canvas);
    transformControls.attach(object);
    return transformControls;
  }
}

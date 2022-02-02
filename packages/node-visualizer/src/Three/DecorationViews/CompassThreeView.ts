// =====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple data set in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
// =====================================================================================

import Color from 'color';
import * as THREE from 'three';

import { Range3 } from '../../Core/Geometry/Range3';
import { CompassNode } from '../../Core/Nodes/Decorations/CompassNode';
import { BaseGroupThreeView } from '../BaseViews/BaseGroupThreeView';
import { ThreeConverter } from '../Utilities/ThreeConverter';

export class CompassThreeView extends BaseGroupThreeView {
  // ==================================================
  // STATIC FIELDS
  // ==================================================

  private static topColor = Color.rgb(0, 154, 23); // grass green

  private static bottomColor = Color.rgb(236, 45, 1); // tomato red

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
  }

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected get node(): CompassNode {
    return super.getNode() as CompassNode;
  }

  // ==================================================
  // OVERRIDES of Base3DView
  // ==================================================

  public /* override */ calculateBoundingBoxCore(): Range3 | undefined {
    return undefined;
  }

  // ==================================================
  // OVERRIDES of BaseThreeView
  // ==================================================

  protected get /* virtual */ scene(): THREE.Scene {
    return this.renderTarget.miniWindowScene;
  }

  // ==================================================
  // OVERRIDES of BaseGroupThreeView
  // ==================================================

  protected /* override */ createObject3DCore(): THREE.Object3D | null {
    const group = new THREE.Group();
    group.add(this.createSolid(true));
    group.add(this.createSolid(false));
    return group;
  }

  public /* override */ beforeRender(): void {
    super.beforeRender();

    const group = this.object3D;
    if (!group) return;

    group.quaternion.copy(this.camera.quaternion).inverse();
    group.updateMatrixWorld();
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private createSolid(top: boolean): THREE.Object3D {
    //      ^5     -- ymax
    //     / \
    //    /   \
    //  6/_____\4  -- ymed
    //    0| |3    -- 0
    //     | |
    //     | |
    //     | |
    //     +-+     -- ymax
    //     1 2

    const zMax = 0.2;
    const xMed = 0.3;
    const xMax = 0.6;
    const yMax = 0.925;
    const yMed = 0.2;

    const s = top ? 1 : -1;
    const geometry = new THREE.Geometry();

    for (let pass = 0; pass < 2; pass++) {
      const z = pass === 0 ? s * zMax : 0;

      // The order of the points here follows the drawing above
      geometry.vertices.push(new THREE.Vector3(-xMed, yMed, z));
      geometry.vertices.push(new THREE.Vector3(-xMed, -yMax, z));
      geometry.vertices.push(new THREE.Vector3(+xMed, -yMax, z));
      geometry.vertices.push(new THREE.Vector3(+xMed, yMed, z));
      geometry.vertices.push(new THREE.Vector3(+xMax, yMed, z));
      geometry.vertices.push(new THREE.Vector3(0, yMax, z));
      geometry.vertices.push(new THREE.Vector3(-xMax, yMed, z));
    }
    const up = new THREE.Vector3(+0, +0, 1);
    const west = new THREE.Vector3(-s, +0, 0);
    const south = new THREE.Vector3(+0, -s, 0);
    const east = new THREE.Vector3(+s, +0, 0);
    const northEast = new THREE.Vector3(+s, +s, 0);
    const northWest = new THREE.Vector3(-s, +s, 0);
    northEast.normalize();
    northWest.normalize();

    geometry.faces.push(new THREE.Face3(0, 1, 2, up));
    geometry.faces.push(new THREE.Face3(0, 2, 3, up));
    geometry.faces.push(new THREE.Face3(4, 5, 6, up));
    geometry.faces.push(new THREE.Face3(0, 1, 7, west));
    geometry.faces.push(new THREE.Face3(7, 1, 8, west));
    geometry.faces.push(new THREE.Face3(1, 2, 8, south));
    geometry.faces.push(new THREE.Face3(8, 2, 9, south));
    geometry.faces.push(new THREE.Face3(2, 3, 9, east));
    geometry.faces.push(new THREE.Face3(9, 3, 10, east));
    geometry.faces.push(new THREE.Face3(3, 4, 10, south));
    geometry.faces.push(new THREE.Face3(10, 4, 11, south));
    geometry.faces.push(new THREE.Face3(4, 5, 11, northEast));
    geometry.faces.push(new THREE.Face3(11, 5, 12, northEast));
    geometry.faces.push(new THREE.Face3(5, 6, 12, northWest));
    geometry.faces.push(new THREE.Face3(12, 6, 13, northWest));
    geometry.faces.push(new THREE.Face3(6, 0, 13, south));
    geometry.faces.push(new THREE.Face3(13, 0, 7, south));

    const material = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
      flatShading: true,
      color: ThreeConverter.toThreeColor(
        top ? CompassThreeView.topColor : CompassThreeView.bottomColor
      ),
    });
    return new THREE.Mesh(geometry, material);
  }
}

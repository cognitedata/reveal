/*!
 * Copyright 2024 Cognite AS
 */

import { Box3, Vector3, type BufferGeometry, type Matrix4, BoxGeometry } from 'three';
import { OBB } from 'three/addons/math/OBB.js';
import { type LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { PrimitiveUtils } from './PrimitiveUtils';

const HALF_SIDE = 0.5;

export const CUBE_CORNERS = [
  new Vector3(-HALF_SIDE, -HALF_SIDE, -HALF_SIDE),
  new Vector3(+HALF_SIDE, -HALF_SIDE, -HALF_SIDE),
  new Vector3(+HALF_SIDE, +HALF_SIDE, -HALF_SIDE),
  new Vector3(-HALF_SIDE, +HALF_SIDE, -HALF_SIDE),
  new Vector3(-HALF_SIDE, -HALF_SIDE, +HALF_SIDE),
  new Vector3(+HALF_SIDE, -HALF_SIDE, +HALF_SIDE),
  new Vector3(+HALF_SIDE, +HALF_SIDE, +HALF_SIDE),
  new Vector3(-HALF_SIDE, +HALF_SIDE, +HALF_SIDE)
];
export class BoxUtils {
  public static createUnitGeometry(): BoxGeometry {
    return new BoxGeometry(1, 1, 1);
  }

  public static expandBoundingBox(boundingBox: Box3, matrix: Matrix4): void {
    const copyOfCorner = new Vector3();
    for (const corner of CUBE_CORNERS) {
      copyOfCorner.copy(corner);
      copyOfCorner.applyMatrix4(matrix);
      boundingBox.expandByPoint(copyOfCorner);
    }
  }

  public static getBoundingBox(matrix: Matrix4): Box3 {
    const boundingBox = new Box3().makeEmpty();
    BoxUtils.expandBoundingBox(boundingBox, matrix);
    return boundingBox;
  }

  public static createOrientedBox(matrix: Matrix4): OBB {
    const orientedBox = new OBB(new Vector3(), new Vector3().setScalar(HALF_SIDE));
    orientedBox.applyMatrix4(matrix);
    return orientedBox;
  }

  public static createLineSegmentsGeometry(): LineSegmentsGeometry {
    const positions = BoxUtils.createPositions();
    return PrimitiveUtils.createLineSegmentsGeometryByPosition(positions);
  }

  public static createPositions(): number[] {
    // Define positions of a cube
    const positions = CUBE_CORNERS.flatMap((vertex) => [vertex.x, vertex.y, vertex.z]);

    // Define the order of the vertices to form line segments of the cube
    const bottomIndices = [0, 1, 1, 2, 2, 3, 3, 0];
    const topIndices = [4, 5, 5, 6, 6, 7, 7, 4];
    const sideIndices = [0, 4, 1, 5, 2, 6, 3, 7];
    const indices = [...bottomIndices, ...topIndices, ...sideIndices];

    return PrimitiveUtils.createLineSegmentsAsPositions(positions, indices);
  }

  public static createLineSegmentsBufferGeometry(): BufferGeometry {
    const positions = BoxUtils.createPositions();
    return PrimitiveUtils.createBufferGeometry(positions);
  }
}

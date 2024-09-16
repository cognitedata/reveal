/*!
 * Copyright 2024 Cognite AS
 */

import {
  type AnnotationsBoundingVolume,
  type AnnotationsBox,
  type AnnotationsCogniteAnnotationTypesPrimitivesGeometry3DGeometry as AnnotationGeometry,
  type AnnotationsCylinder
} from '@cognite/sdk';

import { type PointCloudAnnotation } from '../utils/types';
import { isAnnotationsBoundingVolume } from '../utils/annotationGeometryUtils';
import { remove } from '../../../base/utilities/extensions/arrayExtensions';
import { type Box3, Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { getRandomInt } from '../../../base/utilities/extensions/mathExtensions';
import { getAnnotationMatrixByGeometry } from './getMatrixUtils';
import { PrimitiveType } from '../../primitives/common/PrimitiveType';
import { getBoundingBox } from '../utils/getBoundingBox';

export class SingleAnnotation {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public annotation: PointCloudAnnotation;
  public selectedGeometry?: AnnotationGeometry;

  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  constructor(annotation: PointCloudAnnotation, selectedGeometry?: AnnotationGeometry) {
    this.annotation = annotation;
    this.selectedGeometry = selectedGeometry;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public get isSingle(): boolean {
    const region = this.region;
    return region !== undefined && region.length === 1;
  }

  public get firstGeometry(): AnnotationGeometry | undefined {
    const region = this.region;
    if (region === undefined) {
      return undefined;
    }
    return region[0];
  }

  public get isCylinder(): boolean {
    return this.primitiveType === PrimitiveType.Cylinder;
  }

  public get isBox(): boolean {
    return this.primitiveType === PrimitiveType.Box;
  }

  public get primitiveType(): PrimitiveType {
    const { selectedGeometry } = this;
    if (selectedGeometry !== undefined) {
      if (selectedGeometry.box !== undefined) {
        return PrimitiveType.Box;
      }
      if (selectedGeometry.cylinder !== undefined) {
        return PrimitiveType.Cylinder;
      }
      return PrimitiveType.None;
    }
    // if (!this.isSingle) {
    //   return PrimitiveType.None;
    // }
    // const geometry = this.firstGeometry;
    // if (geometry === undefined) {
    //   return PrimitiveType.None;
    // }
    // if (geometry.box !== undefined) {
    //   return PrimitiveType.Box;
    // }
    // if (geometry.cylinder !== undefined) {
    //   return PrimitiveType.Cylinder;
    // }
    return PrimitiveType.None;
  }

  private get region(): AnnotationGeometry[] | undefined {
    const volume = this.annotation.geometry;
    if (!isAnnotationsBoundingVolume(volume)) {
      return undefined;
    }
    if (volume === undefined || volume.region.length === 0) {
      return undefined;
    }
    return volume.region;
  }

  public *getGeometries(): Generator<AnnotationGeometry> {
    const region = this.region;
    if (region === undefined) {
      return;
    }
    for (const geometry of region) {
      yield geometry;
    }
  }

  public getBoundingBox(): Box3 | undefined {
    return getBoundingBox(this.annotation, new Matrix4().identity());
  }

  public getMatrix(): Matrix4 | undefined {
    const { selectedGeometry: geometry } = this;
    if (geometry === undefined) {
      return undefined;
    }
    const matrix = getAnnotationMatrixByGeometry(geometry, 0);
    if (matrix === undefined) {
      return undefined;
    }
    return matrix;
  }

  public equals(other: SingleAnnotation | undefined): boolean {
    if (other === undefined) {
      return false;
    }
    return this.annotation === other.annotation && this.selectedGeometry === other.selectedGeometry;
  }

  public removeSelectedGeometryGeometry(): boolean {
    const region = this.region;
    if (region === undefined) {
      return false;
    }
    if (!remove(region, this.selectedGeometry)) {
      return false;
    }
    this.selectedGeometry = undefined;
    return true;
  }

  public updateFromMatrix(matrix: Matrix4): void {
    const { selectedGeometry } = this;
    if (selectedGeometry === undefined) {
      return;
    }
    if (selectedGeometry.box !== undefined) {
      selectedGeometry.box.matrix = matrix.clone().transpose().elements;
    }
    if (selectedGeometry.cylinder !== undefined) {
      const centerA = new Vector3(0, 0, -0.5).applyMatrix4(matrix);
      const centerB = new Vector3(0, 0, 0.5).applyMatrix4(matrix);
      const scale = new Vector3();
      matrix.decompose(new Vector3(), new Quaternion(), scale);

      selectedGeometry.cylinder.centerA = centerA.toArray();
      selectedGeometry.cylinder.centerB = centerB.toArray();
      selectedGeometry.cylinder.radius = scale.x / 2;
    }
  }

  public align(horizontal: boolean): boolean {
    const { selectedGeometry } = this;
    if (selectedGeometry === undefined) {
      return false;
    }
    if (selectedGeometry.box !== undefined) {
      // Remove x and y rotation
      const matrix = this.getMatrix();
      if (matrix === undefined) {
        return false;
      }
      // Decompose the matrix into translation, rotation (quaternion), and scale
      const position = new Vector3();
      const quaternion = new Quaternion();
      const scale = new Vector3();
      matrix.decompose(position, quaternion, scale);

      // Convert quaternion to Euler angles
      const euler = new Euler().setFromQuaternion(quaternion);

      // Set x and y rotation to zero
      euler.x = 0;
      euler.y = 0;

      // Convert Euler back to quaternion
      quaternion.setFromEuler(euler);

      // Recompose the matrix from the modified components
      const newMatrix = new Matrix4();
      newMatrix.compose(position, quaternion, scale);
      this.updateFromMatrix(newMatrix);
    } else if (selectedGeometry.cylinder !== undefined) {
      const cylinder = selectedGeometry.cylinder;
      const a = new Vector3(...cylinder.centerA);
      const b = new Vector3(...cylinder.centerB);

      if (horizontal) {
        const z = (a.z + b.z) / 2;
        a.z = z;
        b.z = z;
      } else {
        const x = (a.x + b.x) / 2;
        a.x = x;
        b.x = x;
        const y = (a.y + b.y) / 2;
        a.y = y;
        b.y = y;
      }
      if (a.distanceTo(b) < cylinder.radius / 4) {
        return false; // Avoid zero length cylinders
      }
      cylinder.centerA = a.toArray();
      cylinder.centerB = b.toArray();
    } else {
      return false;
    }
    return true;
  }

  // ==================================================
  // STATIC METHODS
  // ==================================================

  public static areEqual(
    a: SingleAnnotation | undefined,
    b: SingleAnnotation | undefined
  ): boolean {
    if (a === undefined && b === undefined) {
      return true;
    }
    if (a === undefined) {
      return false;
    }
    return a.equals(b);
  }

  public static createBox(matrix: Matrix4): SingleAnnotation {
    const box = createBox(matrix);
    return createAnnotation({ box });

    function createBox(matrix: Matrix4): AnnotationsBox {
      const box: AnnotationsBox = {
        confidence: 1,
        label: '',
        matrix: matrix.clone().transpose().elements
      };
      return box;
    }
  }

  public static createCylinder(
    centerA: Vector3,
    centerB: Vector3,
    radius: number
  ): SingleAnnotation {
    const cylinder = createCylinder(centerA, centerB, radius);
    return createAnnotation({ cylinder });

    function createCylinder(
      centerA: Vector3,
      centerB: Vector3,
      radius: number
    ): AnnotationsCylinder {
      const cylinder: AnnotationsCylinder = {
        confidence: 1,
        label: '',
        centerA: centerA.toArray(),
        centerB: centerB.toArray(),
        radius
      };
      return cylinder;
    }
  }
}

function createAnnotation(geometry: AnnotationGeometry): SingleAnnotation {
  const volume: AnnotationsBoundingVolume = {
    confidence: 0.5,
    label: 'test',
    region: [geometry]
  };
  const annotation: PointCloudAnnotation = {
    source: 'asset-centric',
    id: getRandomInt(),
    status: 'approved',
    geometry: volume,
    assetRef: { source: 'asset-centric', id: 0 },
    creatingApp: '3d-management'
  };
  return new SingleAnnotation(annotation, geometry);
}

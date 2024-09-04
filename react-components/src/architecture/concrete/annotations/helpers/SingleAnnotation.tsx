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
import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { getRandomInt } from '../../../base/utilities/extensions/mathExtensions';
import { getAnnotationMatrixByGeometry } from '../utils/getMatrixUtils';
import { PrimitiveType } from '../../primitives/PrimitiveType';

export class SingleAnnotation {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public annotation: PointCloudAnnotation;
  public geometry: AnnotationGeometry;

  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  constructor(annotation: PointCloudAnnotation, geometry: AnnotationGeometry) {
    this.annotation = annotation;
    this.geometry = geometry;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public get isSingle(): boolean {
    const region = this.region;
    return region !== undefined && region.length === 1;
  }

  public get isCylinder(): boolean {
    const region = this.region;
    return region !== undefined && region.length === 1 && region[0].cylinder !== undefined;
  }

  public get primitiveType(): PrimitiveType {
    const region = this.region;
    if (region === undefined || region.length !== 1) {
      return PrimitiveType.None;
    }
    if (region[0].cylinder !== undefined) {
      return PrimitiveType.Cylinder;
    } else {
      return PrimitiveType.Box;
    }
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

  public getMatrix(): Matrix4 | undefined {
    const { geometry } = this;
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
    return this.annotation === other.annotation && this.geometry === other.geometry;
  }

  public removeGeometry(): boolean {
    const region = this.region;
    if (region === undefined) {
      return false;
    }
    return remove(region, this.geometry);
  }

  public updateFromMatrix(matrix: Matrix4): void {
    const { geometry } = this;
    if (geometry.box !== undefined) {
      geometry.box.matrix = matrix.clone().transpose().elements;
    }
    if (geometry.cylinder !== undefined) {
      const centerA = new Vector3(0, 0, -0.5).applyMatrix4(matrix);
      const centerB = new Vector3(0, 0, 0.5).applyMatrix4(matrix);
      const scale = new Vector3();
      matrix.decompose(new Vector3(), new Quaternion(), scale);

      geometry.cylinder.centerA = centerA.toArray();
      geometry.cylinder.centerB = centerB.toArray();
      geometry.cylinder.radius = scale.x / 2;
    }
  }

  public align(horizontal: boolean): boolean {
    const { geometry } = this;
    if (geometry === undefined) {
      return false;
    }
    if (geometry.box !== undefined) {
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
      const euler = new Euler().setFromQuaternion(quaternion, 'ZYX');

      // Set x and y rotation to zero
      euler.x = 0;
      euler.y = 0;

      // Convert Euler back to quaternion
      quaternion.setFromEuler(euler);

      // Recompose the matrix from the modified components
      const newMatrix = new Matrix4();
      newMatrix.compose(position, quaternion, scale);
      this.updateFromMatrix(newMatrix);
    } else if (geometry.cylinder !== undefined) {
      const cylinder = geometry.cylinder;
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

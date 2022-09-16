/*!
 * Copyright 2022 Cognite AS
 */

import { Box } from './Box';
import { Cylinder } from './Cylinder';
import { IShape, ShapeType } from './IShape';

import * as THREE from 'three';
import { CompositeShape } from './CompositeShape';
import { assertNever } from '@reveal/utilities';

function createBoundingBoxForBox(box: Box): THREE.Box3 {
  const baseBox = new THREE.Box3(new THREE.Vector3(-0.5, -0.5, -0.5), new THREE.Vector3(0.5, 0.5, 0.5));
  const instanceMatrix = new THREE.Matrix4().fromArray(box.invMatrix.data).invert();

  return baseBox.applyMatrix4(instanceMatrix);
}

function createBoundingBoxForCylinder(cylinder: Cylinder): THREE.Box3 {
  const centerA = new THREE.Vector3().fromArray(cylinder.centerA);
  const centerB = new THREE.Vector3().fromArray(cylinder.centerB);
  const middle = centerA.clone().add(centerB).multiplyScalar(0.5);
  const axisVec = middle.clone().sub(centerB);

  const axisOption0 = new THREE.Vector3(1, 0, 0);
  const axisOption1 = new THREE.Vector3(0, 1, 0);

  const chosenAxis =
    Math.abs(axisOption0.dot(axisVec)) < Math.abs(axisOption1.dot(axisVec)) ? axisOption0 : axisOption1;

  const perpVector0 = chosenAxis.clone().cross(axisVec).normalize().multiplyScalar(cylinder.radius);
  const perpVector1 = perpVector0.clone().cross(axisVec).normalize().multiplyScalar(cylinder.radius);

  const matrix = new THREE.Matrix4().makeBasis(axisVec, perpVector0, perpVector1);
  matrix.setPosition(middle);

  const baseBox = new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
  return baseBox.applyMatrix4(matrix);
}

function createBoundingBoxForComposite(composite: CompositeShape): THREE.Box3 {
  const box = new THREE.Box3();

  for (const shape of composite.innerShapes) {
    box.union(createShapeBoundingBox(shape));
  }

  return box;
}

export function createShapeBoundingBox(shape: IShape): THREE.Box3 {
  switch (shape.shapeType) {
    case ShapeType.Box: {
      const box = shape as Box;
      return createBoundingBoxForBox(box);
    }
    case ShapeType.Cylinder: {
      const cylinder = shape as Cylinder;
      return createBoundingBoxForCylinder(cylinder);
    }
    case ShapeType.Composite: {
      const composite = shape as CompositeShape;
      return createBoundingBoxForComposite(composite);
    }
    default:
      assertNever(shape.shapeType);
  }
}

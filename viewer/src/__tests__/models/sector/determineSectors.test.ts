/*!
 * Copyright 2019 Cognite AS
 */
import * as THREE from 'three';
import { SectorMetadata, SectorModelTransformation } from '../../../models/sector/types';
import { Box3 } from '../../../utils/Box3';
import { vec3, mat4 } from 'gl-matrix';
import { determineSectors, determineSectorsQuality } from '../../../models/sector/determineSectors';
import { expectSetEqual } from '../../expects';
import { toThreeMatrix4, fromThreeMatrix, fromThreeVector3 } from '../../../views/threejs/utilities';
import 'jest-extended';
import { traverseDepthFirst } from '../../../utils/traversal';

function createSceneFromRoot(root: SectorMetadata) {
  const sectors = new Map<number, SectorMetadata>();
  traverseDepthFirst(root, sector => {
    sectors.set(sector.id, sector);
    return true;
  });
  return {
    root,
    sectors
  };
}

describe('determineSectors', () => {
  const identityTransform: SectorModelTransformation = {
    modelMatrix: mat4.identity(mat4.create()),
    inverseModelMatrix: mat4.identity(mat4.create())
  };

  test('frustum does not intersect root bounds', async () => {
    // Arrange
    const root: SectorMetadata = {
      id: 1,
      path: '0/',
      bounds: new Box3([vec3.fromValues(10, 10, 10), vec3.fromValues(11, 11, 11)]),
      children: []
    };
    const scene = createSceneFromRoot(root);
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 0, -2);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();

    // Act
    const sectors = await determineSectors({
      scene,
      cameraFov: camera.fov,
      cameraPosition: fromThreeVector3(vec3.create(), camera.position, identityTransform),
      cameraModelMatrix: fromThreeMatrix(mat4.create(), camera.matrixWorld, identityTransform),
      projectionMatrix: fromThreeMatrix(mat4.create(), camera.projectionMatrix, identityTransform)
    });

    // Assert
    expect(sectors.detailed).toBeEmpty();
  });

  test('partial intersect, returns correct sectors', async () => {
    // Arrange
    const root: SectorMetadata = {
      id: 1,
      path: '0/',
      bounds: new Box3([vec3.fromValues(0, 0, 0), vec3.fromValues(2, 1, 1)]),
      children: [
        {
          id: 2,
          path: '0/0/',
          bounds: new Box3([vec3.fromValues(0, 0, 0), vec3.fromValues(1, 1, 1)]),
          children: []
        },
        {
          id: 3,
          path: '0/1/',
          bounds: new Box3([vec3.fromValues(1, 0, 0), vec3.fromValues(2, 1, 1)]),
          children: []
        }
      ]
    };
    const scene = createSceneFromRoot(root);
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 0, -1);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();

    // Act
    const sectors = await determineSectors({
      scene,
      cameraFov: camera.fov,
      cameraPosition: fromThreeVector3(vec3.create(), camera.position, identityTransform),
      cameraModelMatrix: fromThreeMatrix(mat4.create(), camera.matrixWorld, identityTransform),
      projectionMatrix: fromThreeMatrix(mat4.create(), camera.projectionMatrix, identityTransform)
    });

    // Assert
    expectSetEqual(sectors.detailed, [1, 2]);
    expectSetEqual(sectors.simple, [3]);
  });

  test('model with transformation, returns correctly', async () => {
    // Arrange
    const modelMatrix = mat4.fromRotation(mat4.create(), Math.PI, [0, 1, 0]);
    const inverseModelMatrix = mat4.invert(mat4.create(), modelMatrix)!;
    const transform = {
      modelMatrix,
      inverseModelMatrix
    };
    const root: SectorMetadata = {
      id: 1,
      path: '0/',
      bounds: new Box3([vec3.fromValues(1, 1, 1), vec3.fromValues(2, 2, 2)]),
      children: []
    };
    const scene = createSceneFromRoot(root);
    const camera = new THREE.PerspectiveCamera();
    camera.position.copy(new THREE.Vector3(1.5, 1.5, -1).applyMatrix4(toThreeMatrix4(transform.modelMatrix)));
    camera.lookAt(new THREE.Vector3(1.5, 1.5, 1.5).applyMatrix4(toThreeMatrix4(transform.modelMatrix)));
    camera.updateMatrixWorld();

    // Act
    const sectors = await determineSectors({
      scene,
      cameraFov: camera.fov,
      cameraPosition: fromThreeVector3(vec3.create(), camera.position, transform),
      cameraModelMatrix: fromThreeMatrix(mat4.create(), camera.matrixWorld, transform),
      projectionMatrix: fromThreeMatrix(mat4.create(), camera.projectionMatrix, transform)
    });

    // Assert
    expectSetEqual(sectors.detailed, [1]);
  });
});

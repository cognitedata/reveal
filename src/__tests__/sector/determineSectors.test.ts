/*!
 * Copyright 2019 Cognite AS
 */
import * as THREE from 'three';
import { SectorMetadata, SectorModelTransformation } from '../../sector/types';
import { Box3 } from '../../utils/Box3';
import { vec3, mat4 } from 'gl-matrix';
import { determineSectors } from '../../sector/determineSectors';
import { expectSetEqual } from '../expects';
import { toThreeMatrix4 } from '../../views/threejs/utilities';
import 'jest-extended';

describe('determineSectors', () => {
  const identityTransform: SectorModelTransformation = {
    modelMatrix: mat4.identity(mat4.create())
  };

  test('frustum does not intersect root bounds', async () => {
    // Arrange
    const root: SectorMetadata = {
      id: 1,
      path: '0/',
      bounds: new Box3([vec3.fromValues(10, 10, 10), vec3.fromValues(11, 11, 11)]),
      children: []
    };
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 0, -2);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();

    // Act
    const sectors = await determineSectors(root, camera, identityTransform);

    // Assert
    expect(sectors.simple).toBeEmpty();
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
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 0, -1);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();

    // Act
    const sectors = await determineSectors(root, camera, identityTransform);

    // Assert
    expectSetEqual(sectors.detailed, [1, 2]);
    expect(sectors.simple).toBeEmpty();
  });

  test('model with transformation, returns correctly', async () => {
    // Arrange
    const transform = {
      modelMatrix: mat4.fromRotation(mat4.create(), Math.PI, [0, 1, 0])
    };
    const root: SectorMetadata = {
      id: 1,
      path: '0/',
      bounds: new Box3([vec3.fromValues(1, 1, 1), vec3.fromValues(2, 2, 2)]),
      children: []
    };
    const camera = new THREE.PerspectiveCamera();
    camera.position.copy(new THREE.Vector3(1.5, 1.5, -1).applyMatrix4(toThreeMatrix4(transform.modelMatrix)));
    camera.lookAt(new THREE.Vector3(1.5, 1.5, 1.5).applyMatrix4(toThreeMatrix4(transform.modelMatrix)));
    camera.updateMatrixWorld();

    // Act
    const sectors = await determineSectors(root, camera, transform);

    // Assert
    expectSetEqual(sectors.detailed, [1]);
  });
});

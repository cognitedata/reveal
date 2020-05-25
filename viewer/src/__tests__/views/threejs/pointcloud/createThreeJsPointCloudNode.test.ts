/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { mat4 } from 'gl-matrix';

import { PointCloudModel } from '@/dataModels/point-cloud';
import { FetchPointCloudDelegate } from '@/dataModels/point-cloud/internal/delegates';
import { SectorModelTransformation } from '@/dataModels/cad/sector/types';
import { PotreeGroupWrapper } from '@/dataModels/point-cloud/internal/PotreeGroupWrapper';
import { createThreeJsPointCloudNode } from '@/dataModels/point-cloud/internal/createThreeJsPointCloudNode';

describe('createThreeJsPointCloudNode', () => {
  const geometry = {
    boundingBox: new THREE.Box3(),
    tightBoundingBox: new THREE.Box3(),
    offset: new THREE.Vector3()
  };
  const fetchPointcloud: FetchPointCloudDelegate = async () => {
    const transform: SectorModelTransformation = {
      modelMatrix: mat4.identity(mat4.create()),
      inverseModelMatrix: mat4.identity(mat4.create())
    };
    return [geometry, transform];
  };
  const model: PointCloudModel = [fetchPointcloud];

  test('throws when loader fails', async () => {
    // Arrange
    const failingFetchPointcloud: FetchPointCloudDelegate = async () => {
      throw new Error();
    };
    const invalidModel: PointCloudModel = [failingFetchPointcloud];

    // Act & Assert
    expect(createThreeJsPointCloudNode(invalidModel)).rejects.toThrowError();
  });

  test('loader succeeds, returns group and node', async () => {
    const [group, node] = await createThreeJsPointCloudNode(model);

    expect(group).not.toBeNull();
    expect(node).not.toBeNull();
    expect(group.pointClouds()).toContainEqual(node);
  });

  test('called with group, adds to provided group', async () => {
    const existingGroup = new PotreeGroupWrapper();
    expect(existingGroup.pointClouds()).toBeEmpty();
    const [returnedGroup, node] = await createThreeJsPointCloudNode(model, existingGroup);

    expect(returnedGroup).toBe(existingGroup);
    expect(returnedGroup.pointClouds()).toContainEqual(node);
  });
});

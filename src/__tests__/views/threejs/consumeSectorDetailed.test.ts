/*!
 * Copyright 2019 Cognite AS
 */

import { Sector, SectorMetadata, TriangleMesh } from '../../../models/sector/types';
import { Box3 } from '../../../utils/Box3';
import { vec3 } from 'gl-matrix';
import { consumeSectorDetailed } from '../../../views/threejs/consumeSectorDetailed';
import { SectorNode } from '../../../views/threejs/SectorNode';
import 'jest-extended';

describe('consumeSectorDetailed', () => {
  const metadata: SectorMetadata = {
    id: 1,
    path: '0/1/2/',
    bounds: new Box3([vec3.fromValues(1, 2, 3), vec3.fromValues(3, 4, 5)]),
    children: []
  };

  test('no geometry, does not add new nodes', () => {
    // Arrange
    const sectorId = 1;
    const sector: Sector = {
      triangleMeshes: []
    };

    const node = new SectorNode();

    // Act
    consumeSectorDetailed(sectorId, sector, metadata, node);

    // Assert
    expect(node.children).toBeEmpty();
  });

  test('single mesh, adds geometry', () => {
    // Arrange
    const sectorId = 1;
    const sector: Sector = {
      triangleMeshes: [newMesh()]
    };
    const node = new SectorNode();

    // Act
    consumeSectorDetailed(sectorId, sector, metadata, node);

    // Assert
    expect(node.children).not.toBeEmpty();
  });

  test('valid input, produces geometry', () => {
    // Arrange
    const sectorId = 1;
    const sector: Sector = {
      triangleMeshes: [newMesh()]
    };
    const node = new SectorNode();

    // Act
    consumeSectorDetailed(sectorId, sector, metadata, node);

    // Assert
    expect(node.children).not.toBeEmpty();
  });
});

function newMesh(): TriangleMesh {
  return {
    fileId: 0,
    indices: new Uint32Array(10),
    vertices: new Float32Array(5),
    colors: new Float32Array(),
    normals: undefined
  };
}

/*!
 * Copyright 2019 Cognite AS
 */

import { Sector, SectorMetadata } from '../../../sector/types';
import { Box3 } from '../../../utils/Box3';
import { vec3 } from 'gl-matrix';
import { consumeSector } from '../../../views/threejs/consumeSector';
import { SectorNode } from '../../../views/threejs/SectorNode';
import 'jest-extended';
import { TriangleMesh } from '../../../../pkg';

describe('consumeSector', () => {
  test('valid input, produces geometry', () => {
    // Arrange
    const sectorId = 1;
    const sector: Sector = {
      triangleMeshes: []
    };
    const metadata: SectorMetadata = {
      id: 1,
      path: '0/1/2/',
      bounds: new Box3([vec3.fromValues(1, 2, 3), vec3.fromValues(3, 4, 5)]),
      children: []
    };
    const node = new SectorNode();

    // Act
    consumeSector(sectorId, sector, metadata, node);

    // Assert
    expect(node.children).not.toBeEmpty();
  });

  // TODO 20191023 larsmoa: Add unit test for consumeSector with actual geometry
});

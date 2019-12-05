/*!
 * Copyright 2019 Cognite AS
 */

import { SectorQuads, SectorMetadata, TriangleMesh } from '../../../../models/sector/types';
import { Box3 } from '../../../../utils/Box3';
import { vec3 } from 'gl-matrix';
import { consumeSectorSimple } from '../../../../views/threejs/sector/consumeSectorSimple';
import { SectorNode } from '../../../../views/threejs/sector/SectorNode';
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
    const sector: SectorQuads = {
      buffer: new Float32Array(0)
    };

    const node = new SectorNode();

    // Act
    consumeSectorSimple(sectorId, sector, metadata, node);

    // Assert
    expect(node.children).toBeEmpty();
  });

  test('single mesh, adds geometry', () => {
    // Arrange
    const sectorId = 1;
    const sector: SectorQuads = {
      buffer: new Float32Array([
        // tslint:disable: prettier
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
        // tslint:enable: prettier
      ])
    };
    const node = new SectorNode();

    // Act
    consumeSectorSimple(sectorId, sector, metadata, node);

    // Assert
    expect(node.children).not.toBeEmpty();
  });
});

/*!
 * Copyright 2019 Cognite AS
 */

import { SectorQuads, SectorMetadata } from '../../../../models/cad/types';
import { Box3 } from '../../../../utils/Box3';
import { vec3 } from 'gl-matrix';
import { consumeSectorSimple } from '../../../../views/threejs/cad/consumeSectorSimple';
import { SectorNode } from '../../../../views/threejs/cad/SectorNode';
import 'jest-extended';

describe('consumeSectorDetailed', () => {
  const metadata: SectorMetadata = {
    id: 1,
    path: '0/1/2/',
    bounds: new Box3([vec3.fromValues(1, 2, 3), vec3.fromValues(3, 4, 5)]),
    children: []
  };
  const sectorId = 1;
  const node = new SectorNode(sectorId, '0/');

  test('no geometry, does not add new nodes', () => {
    // Arrange
    const sector: SectorQuads = {
      buffer: new Float32Array(0)
    };

    // Act
    consumeSectorSimple(sectorId, sector, metadata, node);

    // Assert
    expect(node.children).toBeEmpty();
  });

  test('single valid mesh, adds geometry', () => {
    // Arrange
    const sector: SectorQuads = {
      buffer: new Float32Array([
        // tslint:disable: prettier
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        42.0,
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
        // tslint:enable: prettier
      ])
    };

    // Act
    consumeSectorSimple(sectorId, sector, metadata, node);

    // Assert
    expect(node.children).not.toBeEmpty();
  });

  test('buffer has two elements, success', () => {
    // Arrange
    const sector: SectorQuads = {
      buffer: new Float32Array([
        // tslint:disable: prettier
        // First element
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        42.0,
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0,
        // Second element
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        42.0,
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
        // tslint:enable: prettier
      ])
    };

    // Act
    consumeSectorSimple(sectorId, sector, metadata, node);

    // Assert
    expect(node.children.length).toBe(2);
  });

  test('buffer has extra bytes, throws', () => {
    // Arrange
    const sector: SectorQuads = {
      buffer: new Float32Array([
        // tslint:disable: prettier
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        42.0,
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0,
        
        0.13337,
        // tslint:enable: prettier
      ])
    };

    // Act
    expect(() => consumeSectorSimple(sectorId, sector, metadata, node)).toThrowError();
  });

  test('buffer missing bytes, throws', () => {
    // Arrange
    const sector: SectorQuads = {
      buffer: new Float32Array([
        // tslint:disable: prettier
        0.0, 0.0, 0.0,
        // tslint:enable: prettier
      ])
    };

    // Act
    expect(() => consumeSectorSimple(sectorId, sector, metadata, node)).toThrowError();
  });
});

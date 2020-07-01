/*!
 * Copyright 2020 Cognite AS
 */

import { createMaterials } from '@/datamodels/cad/rendering/materials';
import 'jest-extended';
import { RenderMode } from '@/datamodels/cad/rendering/RenderMode';
import { SectorQuads } from '@/datamodels/cad/rendering/types';
import { consumeSectorSimple } from '@/datamodels/cad/sector/sectorUtilities';

const materials = createMaterials(64, RenderMode.Color, []);

describe('consumeSectorDetailed', () => {
  test('no geometry, does not add new nodes', () => {
    // Arrange
    const sector: SectorQuads = {
      nodeIdToTreeIndexMap: new Map(),
      treeIndexToNodeIdMap: new Map(),
      buffer: new Float32Array(0)
    };

    // Act
    const group = consumeSectorSimple(sector, materials);

    // Assert
    expect(group.children).toBeEmpty();
  });

  test('single valid mesh, adds geometry', () => {
    // Arrange
    const sector: SectorQuads = {
      nodeIdToTreeIndexMap: new Map(),
      treeIndexToNodeIdMap: new Map(),
      buffer: new Float32Array([
        /* eslint-disable prettier/prettier */
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        42.0,
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
        /* eslint-enable prettier/prettier */
      ])
    };

    // Act
    const group = consumeSectorSimple(sector, materials);

    // Assert
    expect(group.children).not.toBeEmpty();
  });

  test('buffer has two elements, success', () => {
    // Arrange
    const sector: SectorQuads = {
      nodeIdToTreeIndexMap: new Map(),
      treeIndexToNodeIdMap: new Map(),
      buffer: new Float32Array([
        /* eslint-disable prettier/prettier */
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
        /* eslint-enable prettier/prettier */
      ])
    };

    // Act
    const group = consumeSectorSimple(sector, materials);

    // Assert
    expect(group.children.length).toBe(1);
  });

  test('buffer has extra bytes, throws', () => {
    // Arrange
    const sector: SectorQuads = {
      nodeIdToTreeIndexMap: new Map(),
      treeIndexToNodeIdMap: new Map(),
      buffer: new Float32Array([
        /* eslint-disable prettier/prettier */
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        42.0,
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0,

        0.13337,
        /* eslint-enable prettier/prettier */
      ])
    };

    // Act
    expect(() => consumeSectorSimple(sector, materials)).toThrowError();
  });

  test('buffer missing bytes, throws', () => {
    // Arrange
    const sector: SectorQuads = {
      nodeIdToTreeIndexMap: new Map(),
      treeIndexToNodeIdMap: new Map(),
      buffer: new Float32Array([
        /* eslint-disable prettier/prettier */
        0.0, 0.0, 0.0,
        /* eslint-enable prettier/prettier */
      ])
    };

    // Act
    expect(() => consumeSectorSimple(sector, materials)).toThrowError();
  });
});

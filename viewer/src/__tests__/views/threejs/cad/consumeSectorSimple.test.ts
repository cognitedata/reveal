/*!
 * Copyright 2020 Cognite AS
 */

import { SectorQuads } from '../../../../models/cad/types';
import { consumeSectorSimple } from '../../../../views/threejs/cad/consumeSectorSimple';
import { createMaterials } from '../../../../views/threejs/cad/materials';
import 'jest-extended';
import { RenderMode } from '../../../../views/threejs/materials';

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
    expect(() => consumeSectorSimple(sector, materials)).toThrowError();
  });

  test('buffer missing bytes, throws', () => {
    // Arrange
    const sector: SectorQuads = {
      nodeIdToTreeIndexMap: new Map(),
      treeIndexToNodeIdMap: new Map(),
      buffer: new Float32Array([
        // tslint:disable: prettier
        0.0, 0.0, 0.0,
        // tslint:enable: prettier
      ])
    };

    // Act
    expect(() => consumeSectorSimple(sector, materials)).toThrowError();
  });
});

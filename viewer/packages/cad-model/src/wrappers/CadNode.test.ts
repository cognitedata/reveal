/*!
 * Copyright 2025 Cognite AS
 */
import { Mock } from 'moq.ts';
import { CadNode } from './CadNode';
import { SectorRepository } from '@reveal/sector-loader';
import { Matrix4, BufferGeometry, BufferAttribute, Box3, Vector3, CanvasTexture } from 'three';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import { ParsedMeshGeometry } from '@reveal/cad-parsers';

import { jest } from '@jest/globals';
import { createCadNode } from '../../../../test-utilities/src/createCadNode';

describe(CadNode.name, () => {
  test('should call sector repository cache clear on disposal', () => {
    const sectorRepositoryMock = new Mock<SectorRepository>()
      .setup(p => p.clearCache)
      .returns(jest.fn())
      .object();

    const cadNode = createCadNode(3, 3, { sectorRepository: sectorRepositoryMock });

    cadNode.dispose();

    expect(jest.mocked(sectorRepositoryMock).clearCache).toHaveBeenCalledTimes(1);
  });

  test('should return needsRedraw state correctly', () => {
    const cadNode = createCadNode(3, 3);

    // Initially needsRedraw should be false
    expect(cadNode.needsRedraw).toBe(false);

    // After setting model transformation, needsRedraw should be true
    cadNode.setModelTransformation(new Matrix4());
    expect(cadNode.needsRedraw).toBe(true);

    // After reset, needsRedraw should be false again
    cadNode.resetRedraw();
    expect(cadNode.needsRedraw).toBe(false);
  });

  test('should return cadModelIdentifier as symbol', () => {
    const cadNode = createCadNode(3, 3);

    const identifier = cadNode.cadModelIdentifier;

    expect(typeof identifier).toBe('symbol');
  });

  test('should create meshes from parsed geometries with triangle mesh', () => {
    const cadNode = createCadNode(3, 3);

    // Create test geometry
    const geometry = new BufferGeometry();
    const vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const treeIndices = new Float32Array([1, 1, 2]);
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    geometry.setAttribute('treeIndex', new BufferAttribute(treeIndices, 1));

    const boundingBox = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1));

    const parsedGeometries: ParsedMeshGeometry[] = [
      {
        type: RevealGeometryCollectionType.TriangleMesh,
        geometryBuffer: geometry,
        wholeSectorBoundingBox: boundingBox
      }
    ];

    const result = cadNode.createMeshesFromParsedGeometries(parsedGeometries, 1);

    expect(result).toBeDefined();
    expect(result.children.length).toBe(1);
    expect(result.children[0].type).toBe('Mesh');
  });

  test('should create meshes from parsed geometries with textured triangle mesh', () => {
    const cadNode = createCadNode(3, 3);

    // Create test geometry
    const geometry = new BufferGeometry();
    const vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const treeIndices = new Float32Array([1, 1, 2]);
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    geometry.setAttribute('treeIndex', new BufferAttribute(treeIndices, 1));

    const boundingBox = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1));

    // Create test texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const texture = new CanvasTexture(canvas);

    const parsedGeometries: ParsedMeshGeometry[] = [
      {
        type: RevealGeometryCollectionType.TexturedTriangleMesh,
        geometryBuffer: geometry,
        wholeSectorBoundingBox: boundingBox,
        texture: texture
      }
    ];

    const result = cadNode.createMeshesFromParsedGeometries(parsedGeometries, 1);

    expect(result).toBeDefined();
    expect(result.children.length).toBe(1);
    expect(result.children[0].type).toBe('Mesh');
  });

  test('should handle mixed geometry types in createMeshesFromParsedGeometries', () => {
    const cadNode = createCadNode(3, 3);

    // Create test geometries
    const geometry1 = new BufferGeometry();
    const vertices1 = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const treeIndices1 = new Float32Array([1, 1, 2]);
    geometry1.setAttribute('position', new BufferAttribute(vertices1, 3));
    geometry1.setAttribute('treeIndex', new BufferAttribute(treeIndices1, 1));

    const geometry2 = new BufferGeometry();
    const vertices2 = new Float32Array([0, 0, 0, 2, 0, 0, 0, 2, 0]);
    const treeIndices2 = new Float32Array([3, 3, 4]);
    geometry2.setAttribute('position', new BufferAttribute(vertices2, 3));
    geometry2.setAttribute('treeIndex', new BufferAttribute(treeIndices2, 1));

    const boundingBox = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1));

    // Create test texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const texture = new CanvasTexture(canvas);

    const parsedGeometries: ParsedMeshGeometry[] = [
      {
        type: RevealGeometryCollectionType.TriangleMesh,
        geometryBuffer: geometry1,
        wholeSectorBoundingBox: boundingBox
      },
      {
        type: RevealGeometryCollectionType.TexturedTriangleMesh,
        geometryBuffer: geometry2,
        wholeSectorBoundingBox: boundingBox,
        texture: texture
      }
    ];

    const result = cadNode.createMeshesFromParsedGeometries(parsedGeometries, 1);

    expect(result).toBeDefined();
    expect(result.children.length).toBe(2);
    expect(result.children[0].type).toBe('Mesh');
    expect(result.children[1].type).toBe('Mesh');
  });

  test('should create empty group when no geometries provided', () => {
    const cadNode = createCadNode(3, 3);

    const result = cadNode.createMeshesFromParsedGeometries([], 1);

    expect(result).toBeDefined();
    expect(result.children.length).toBe(0);
  });

  test('should handle geometry without treeIndex attribute', () => {
    const cadNode = createCadNode(3, 3);

    // Create geometry without treeIndex attribute
    const geometry = new BufferGeometry();
    const vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    // Note: No treeIndex attribute

    const boundingBox = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1));

    const parsedGeometries: ParsedMeshGeometry[] = [
      {
        type: RevealGeometryCollectionType.TriangleMesh,
        geometryBuffer: geometry,
        wholeSectorBoundingBox: boundingBox
      }
    ];

    const result = cadNode.createMeshesFromParsedGeometries(parsedGeometries, 1);

    expect(result).toBeDefined();
    expect(result.children.length).toBe(1);
    // Should still create mesh even without treeIndex attribute
    const mesh = result.children[0];
    expect(mesh.userData.treeIndices).toEqual(new Map());
  });

  test('should skip textured geometry without texture', () => {
    const cadNode = createCadNode(3, 3);

    const geometry = new BufferGeometry();
    const vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));

    const boundingBox = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1));

    const parsedGeometries: ParsedMeshGeometry[] = [
      {
        type: RevealGeometryCollectionType.TexturedTriangleMesh,
        geometryBuffer: geometry,
        wholeSectorBoundingBox: boundingBox
        // Note: No texture property
      } as ParsedMeshGeometry
    ];

    const result = cadNode.createMeshesFromParsedGeometries(parsedGeometries, 1);

    expect(result).toBeDefined();
    expect(result.children.length).toBe(0); // Should skip geometry without texture
  });

  test('should properly access model appearance and transform providers with new identifier format', () => {
    const cadNode = createCadNode(3, 3);

    // Test nodeAppearanceProvider
    const appearanceProvider = cadNode.nodeAppearanceProvider;
    expect(appearanceProvider).toBeDefined();

    // Test nodeTransformProvider
    const transformProvider = cadNode.nodeTransformProvider;
    expect(transformProvider).toBeDefined();

    // Test defaultNodeAppearance getter/setter
    const defaultAppearance = cadNode.defaultNodeAppearance;
    expect(defaultAppearance).toBeDefined();

    // Test clippingPlanes getter/setter
    const planes = cadNode.clippingPlanes;
    expect(Array.isArray(planes)).toBe(true);
  });

  test('should create tree index set with proper counting', () => {
    const cadNode = createCadNode(3, 3);

    // Create geometry with repeated tree indices to test counting
    const geometry = new BufferGeometry();
    const vertices = new Float32Array([
      0,
      0,
      0, // vertex 0
      1,
      0,
      0, // vertex 1
      0,
      1,
      0, // vertex 2
      1,
      1,
      0, // vertex 3
      0,
      0,
      1, // vertex 4
      1,
      0,
      1 // vertex 5
    ]);
    const treeIndices = new Float32Array([1, 1, 2, 2, 2, 3]); // 1 appears 2x, 2 appears 3x, 3 appears 1x
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    geometry.setAttribute('treeIndex', new BufferAttribute(treeIndices, 1));

    const boundingBox = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1));

    const parsedGeometries: ParsedMeshGeometry[] = [
      {
        type: RevealGeometryCollectionType.TriangleMesh,
        geometryBuffer: geometry,
        wholeSectorBoundingBox: boundingBox
      }
    ];

    const result = cadNode.createMeshesFromParsedGeometries(parsedGeometries, 1);
    const mesh = result.children[0];
    const treeIndexSet = mesh.userData.treeIndices as Map<number, number>;

    expect(treeIndexSet.get(1)).toBe(2); // index 1 appears 2 times
    expect(treeIndexSet.get(2)).toBe(3); // index 2 appears 3 times
    expect(treeIndexSet.get(3)).toBe(1); // index 3 appears 1 time
  });

  test('should remove sector mesh group when sector is unloaded', () => {
    const cadNode = createCadNode(3, 3);

    // Create and add mesh group for sector
    const geometry = new BufferGeometry();
    const vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));

    const parsedGeometries: ParsedMeshGeometry[] = [
      {
        type: RevealGeometryCollectionType.TriangleMesh,
        geometryBuffer: geometry,
        wholeSectorBoundingBox: new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1))
      }
    ];

    const sectorId = 123;
    const meshGroup = cadNode.createMeshesFromParsedGeometries(parsedGeometries, sectorId);

    expect(meshGroup).toBeDefined();
    expect(meshGroup.children.length).toBe(1);

    // Remove the sector mesh group
    cadNode.removeSectorMeshGroup(sectorId);

    // Verify the group was disposed and cleaned up
    expect(meshGroup.children.length).toBe(0); // AutoDisposeGroup clears children on dispose
  });

  test('should handle multiple sector mesh groups independently', () => {
    const cadNode = createCadNode(3, 3);

    // Create mesh groups for two different sectors
    const geometry1 = new BufferGeometry();
    const vertices1 = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    geometry1.setAttribute('position', new BufferAttribute(vertices1, 3));

    const geometry2 = new BufferGeometry();
    const vertices2 = new Float32Array([2, 2, 2, 3, 2, 2, 2, 3, 2]);
    geometry2.setAttribute('position', new BufferAttribute(vertices2, 3));

    const parsedGeometries1: ParsedMeshGeometry[] = [
      {
        type: RevealGeometryCollectionType.TriangleMesh,
        geometryBuffer: geometry1,
        wholeSectorBoundingBox: new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1))
      }
    ];

    const parsedGeometries2: ParsedMeshGeometry[] = [
      {
        type: RevealGeometryCollectionType.TriangleMesh,
        geometryBuffer: geometry2,
        wholeSectorBoundingBox: new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1))
      }
    ];

    const sectorId1 = 100;
    const sectorId2 = 200;

    const meshGroup1 = cadNode.createMeshesFromParsedGeometries(parsedGeometries1, sectorId1);
    const meshGroup2 = cadNode.createMeshesFromParsedGeometries(parsedGeometries2, sectorId2);

    expect(meshGroup1.children.length).toBe(1);
    expect(meshGroup2.children.length).toBe(1);

    // Remove only the first sector
    cadNode.removeSectorMeshGroup(sectorId1);

    // First group should be disposed, second should remain
    expect(meshGroup1.children.length).toBe(0);
    expect(meshGroup2.children.length).toBe(1);

    // Remove the second sector
    cadNode.removeSectorMeshGroup(sectorId2);
    expect(meshGroup2.children.length).toBe(0);
  });

  test('should replace existing mesh group when sector is updated', () => {
    const cadNode = createCadNode(3, 3);

    const sectorId = 150;

    // Create first mesh group
    const geometry1 = new BufferGeometry();
    const vertices1 = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    geometry1.setAttribute('position', new BufferAttribute(vertices1, 3));

    const parsedGeometries1: ParsedMeshGeometry[] = [
      {
        type: RevealGeometryCollectionType.TriangleMesh,
        geometryBuffer: geometry1,
        wholeSectorBoundingBox: new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1))
      }
    ];

    const firstGroup = cadNode.createMeshesFromParsedGeometries(parsedGeometries1, sectorId);
    expect(firstGroup.children.length).toBe(1);

    // Create second mesh group for the same sector (should replace the first)
    const geometry2 = new BufferGeometry();
    const vertices2 = new Float32Array([2, 2, 2, 3, 2, 2, 2, 3, 2]);
    geometry2.setAttribute('position', new BufferAttribute(vertices2, 3));

    const parsedGeometries2: ParsedMeshGeometry[] = [
      {
        type: RevealGeometryCollectionType.TriangleMesh,
        geometryBuffer: geometry2,
        wholeSectorBoundingBox: new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1))
      }
    ];

    const secondGroup = cadNode.createMeshesFromParsedGeometries(parsedGeometries2, sectorId);

    // First group should be disposed (children cleared)
    expect(firstGroup.children.length).toBe(0);
    // Second group should be active
    expect(secondGroup.children.length).toBe(1);
    expect(secondGroup).not.toBe(firstGroup);
  });

  test('should clean up all mesh groups on dispose', () => {
    const cadNode = createCadNode(3, 3);

    // Create multiple mesh groups
    const createTestGroup = (sectorId: number) => {
      const geometry = new BufferGeometry();
      const vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
      geometry.setAttribute('position', new BufferAttribute(vertices, 3));

      const parsedGeometries: ParsedMeshGeometry[] = [
        {
          type: RevealGeometryCollectionType.TriangleMesh,
          geometryBuffer: geometry,
          wholeSectorBoundingBox: new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1))
        }
      ];

      return cadNode.createMeshesFromParsedGeometries(parsedGeometries, sectorId);
    };

    const group1 = createTestGroup(1);
    const group2 = createTestGroup(2);
    const group3 = createTestGroup(3);

    expect(group1.children.length).toBe(1);
    expect(group2.children.length).toBe(1);
    expect(group3.children.length).toBe(1);

    // Dispose the CadNode
    cadNode.dispose();

    // All groups should be disposed
    expect(group1.children.length).toBe(0);
    expect(group2.children.length).toBe(0);
    expect(group3.children.length).toBe(0);
  });
});

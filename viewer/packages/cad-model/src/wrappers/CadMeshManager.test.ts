/*!
 * Copyright 2025 Cognite AS
 */

import { CadMeshManager } from './CadMeshManager';
import { CadMaterialManager } from '@reveal/rendering';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import { ParsedMeshGeometry } from '@reveal/cad-parsers';
import { AutoDisposeGroup } from '@reveal/utilities';
import { TreeIndexToSectorsMap } from '../utilities/TreeIndexToSectorsMap';

import { BufferGeometry, BufferAttribute, Box3, Vector3, CanvasTexture, Mesh, RawShaderMaterial, Matrix4 } from 'three';

import { jest } from '@jest/globals';
import { Mock } from 'moq.ts';

const createBasicGeometry = (vertices: number[] = [0, 0, 0, 1, 0, 0, 0, 1, 0], treeIndices?: number[]) => {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
  if (treeIndices) {
    geometry.setAttribute('treeIndex', new BufferAttribute(new Float32Array(treeIndices), 1));
  }
  return geometry;
};

const createParsedGeometry = (
  type: RevealGeometryCollectionType,
  geometry: BufferGeometry,
  texture?: CanvasTexture
): ParsedMeshGeometry => ({
  type,
  geometryBuffer: geometry,
  wholeSectorBoundingBox: new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1)),
  ...(texture && { texture })
});

const createTexture = (size: number = 64) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return new CanvasTexture(canvas);
};

const createMockMaterial = (): RawShaderMaterial => {
  const material = new RawShaderMaterial({
    vertexShader: 'void main() {}',
    fragmentShader: 'void main() {}'
  });
  material.uniforms = { inverseModelMatrix: { value: new Matrix4() } };
  return material;
};

const createMockMaterialManager = () => {
  const triangleMaterial = createMockMaterial();
  const texturedMaterial = createMockMaterial();

  const materials = {
    box: createMockMaterial(),
    circle: createMockMaterial(),
    generalRing: createMockMaterial(),
    nut: createMockMaterial(),
    quad: createMockMaterial(),
    cone: createMockMaterial(),
    eccentricCone: createMockMaterial(),
    torusSegment: createMockMaterial(),
    generalCylinder: createMockMaterial(),
    trapezium: createMockMaterial(),
    ellipsoidSegment: createMockMaterial(),
    instancedMesh: createMockMaterial(),
    triangleMesh: triangleMaterial,
    texturedMaterials: {}
  };

  const materialManagerMock = new Mock<CadMaterialManager>()
    .setup(m => m.getModelMaterials)
    .returns(() => materials)
    .setup(m => m.addTexturedMeshMaterial)
    .returns(() => texturedMaterial);

  return { materialManager: materialManagerMock.object(), triangleMaterial, texturedMaterial };
};

const expectMeshGroup = (result: AutoDisposeGroup, expectedChildCount: number) => {
  expect(result).toBeDefined();
  expect(result.children.length).toBe(expectedChildCount);
  if (expectedChildCount > 0) {
    result.children.forEach(child => {
      expect(child.type).toBe('Mesh');
    });
  }
};

const isMesh = (object: unknown): object is Mesh => {
  return object instanceof Mesh;
};

const getMeshFromGroup = (group: AutoDisposeGroup, index: number): Mesh => {
  const child = group.children[index];
  if (isMesh(child)) {
    return child;
  }
  throw new Error(`Expected Mesh at index ${index}, got ${child?.type || 'undefined'}`);
};

describe(CadMeshManager.name, () => {
  let meshManager: CadMeshManager;
  let materialManager: CadMaterialManager;
  let treeIndexToSectorsMap: TreeIndexToSectorsMap;
  let modelId: symbol;

  beforeEach(() => {
    const mocks = createMockMaterialManager();
    materialManager = mocks.materialManager;
    modelId = Symbol('testModel');
    treeIndexToSectorsMap = new TreeIndexToSectorsMap(1000); // Max tree index
    meshManager = new CadMeshManager(materialManager, modelId, treeIndexToSectorsMap);
  });

  test('should create empty mesh group when no geometries provided', () => {
    const result = meshManager.createMeshesFromParsedGeometries([], 1);
    expectMeshGroup(result, 0);
  });

  test('should create mesh from triangle geometry', () => {
    const geometry = createBasicGeometry(undefined, [1, 1, 2]);
    const parsedGeometries = [createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry)];

    const result = meshManager.createMeshesFromParsedGeometries(parsedGeometries, 1);

    expectMeshGroup(result, 1);
    const mesh = getMeshFromGroup(result, 0);
    expect(mesh.frustumCulled).toBe(false);
    expect(mesh.geometry.boundingSphere).toBeDefined();
  });

  test('should create mesh from textured triangle geometry', () => {
    const geometry = createBasicGeometry(undefined, [1, 1, 2]);
    const texture = createTexture();
    const parsedGeometries = [
      createParsedGeometry(RevealGeometryCollectionType.TexturedTriangleMesh, geometry, texture)
    ];

    const result = meshManager.createMeshesFromParsedGeometries(parsedGeometries, 1);

    expectMeshGroup(result, 1);
    expect(result.textures.includes(texture)).toBe(true);
  });

  test('should handle mixed geometry types', () => {
    const geometry1 = createBasicGeometry(undefined, [1, 1, 2]);
    const geometry2 = createBasicGeometry([0, 0, 0, 2, 0, 0, 0, 2, 0], [3, 3, 4]);
    const texture = createTexture(32);

    const parsedGeometries = [
      createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry1),
      createParsedGeometry(RevealGeometryCollectionType.TexturedTriangleMesh, geometry2, texture)
    ];

    const result = meshManager.createMeshesFromParsedGeometries(parsedGeometries, 1);

    expectMeshGroup(result, 2);
  });

  test('should skip textured geometry without texture and log warning', () => {
    const geometry = createBasicGeometry();
    const parsedGeometries: ParsedMeshGeometry[] = [
      {
        type: RevealGeometryCollectionType.TexturedTriangleMesh,
        geometryBuffer: geometry,
        wholeSectorBoundingBox: new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1))
      }
    ];

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const sectorId = 1;

    const result = meshManager.createMeshesFromParsedGeometries(parsedGeometries, sectorId);

    expectMeshGroup(result, 0);
    expect(consoleSpy).toHaveBeenCalledWith(
      `Missing texture for textured triangle mesh in sector ${sectorId} - mesh will be skipped. ` +
        'This will result in missing geometry in the 3D scene.'
    );

    consoleSpy.mockRestore();
  });

  test('should create tree index set with proper counting', () => {
    const vertices = [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1];
    const treeIndices = [1, 1, 2, 2, 2, 3];
    const geometry = createBasicGeometry(vertices, treeIndices);
    const parsedGeometries = [createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry)];

    const result = meshManager.createMeshesFromParsedGeometries(parsedGeometries, 1);
    const mesh = getMeshFromGroup(result, 0);
    const treeIndexSet = mesh.userData.treeIndices;

    expect(treeIndexSet.get(1)).toBe(2);
    expect(treeIndexSet.get(2)).toBe(3);
    expect(treeIndexSet.get(3)).toBe(1);
  });

  test('should handle geometry without treeIndex attribute', () => {
    const geometry = createBasicGeometry();
    const parsedGeometries = [createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry)];

    const result = meshManager.createMeshesFromParsedGeometries(parsedGeometries, 1);

    expectMeshGroup(result, 1);
    const mesh = getMeshFromGroup(result, 0);
    expect(mesh.userData.treeIndices).toEqual(new Map());
  });

  test('should return managed sector IDs', () => {
    const geometry = createBasicGeometry();
    const parsedGeometries = [createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry)];

    meshManager.createMeshesFromParsedGeometries(parsedGeometries, 100);
    meshManager.createMeshesFromParsedGeometries(parsedGeometries, 200);

    const sectorIds = meshManager.getManagedSectorIds();
    expect(sectorIds).toContain(100);
    expect(sectorIds).toContain(200);
    expect(sectorIds.length).toBe(2);
  });

  test('should remove sector mesh group correctly', () => {
    const geometry = createBasicGeometry();
    const parsedGeometries = [createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry)];

    const meshGroup = meshManager.createMeshesFromParsedGeometries(parsedGeometries, 1);
    expect(meshGroup.children.length).toBe(1);

    meshManager.removeSectorMeshGroup(1);
    expect(meshGroup.children.length).toBe(0);
  });

  test('should handle removing non-existent sector', () => {
    // Should not throw when removing a sector that doesn't exist
    expect(() => meshManager.removeSectorMeshGroup(999)).not.toThrow();
  });

  test('should handle multiple sector mesh groups independently', () => {
    const geometry = createBasicGeometry();
    const parsedGeometries = [createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry)];

    const meshGroup1 = meshManager.createMeshesFromParsedGeometries(parsedGeometries, 100);
    const meshGroup2 = meshManager.createMeshesFromParsedGeometries(parsedGeometries, 200);

    expect(meshGroup1.children.length).toBe(1);
    expect(meshGroup2.children.length).toBe(1);

    meshManager.removeSectorMeshGroup(100);
    expect(meshGroup1.children.length).toBe(0);
    expect(meshGroup2.children.length).toBe(1);

    meshManager.removeSectorMeshGroup(200);
    expect(meshGroup2.children.length).toBe(0);
  });

  test('should replace existing mesh group when sector is updated', () => {
    const geometry = createBasicGeometry();
    const parsedGeometries = [createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry)];

    const firstGroup = meshManager.createMeshesFromParsedGeometries(parsedGeometries, 150);
    expect(firstGroup.children.length).toBe(1);

    // Caller should explicitly remove existing mesh group before creating new one
    meshManager.removeSectorMeshGroup(150);
    expect(firstGroup.children.length).toBe(0); // First group should be disposed

    const secondGroup = meshManager.createMeshesFromParsedGeometries(parsedGeometries, 150);
    expect(secondGroup.children.length).toBe(1); // Second group should be active
    expect(secondGroup).not.toBe(firstGroup);
  });

  test('should remove mesh group from scene without disposing shared geometries', () => {
    const geometry = createBasicGeometry();
    const disposeSpy = jest.spyOn(geometry, 'dispose');
    const parsedGeometries = [createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry)];

    const meshGroup = meshManager.createMeshesFromParsedGeometries(parsedGeometries, 1);
    expect(meshGroup.children.length).toBe(1);

    meshManager.removeSectorMeshGroup(1);

    // Mesh group should be cleared but geometry not disposed (managed by cache)
    expect(meshGroup.children.length).toBe(0);
    expect(disposeSpy).not.toHaveBeenCalled();
  });

  test('should remove textured mesh group without disposing shared textures', () => {
    const geometry = createBasicGeometry();
    const texture = createTexture();
    const textureSpy = jest.spyOn(texture, 'dispose');
    const parsedGeometries = [
      createParsedGeometry(RevealGeometryCollectionType.TexturedTriangleMesh, geometry, texture)
    ];

    const meshGroup = meshManager.createMeshesFromParsedGeometries(parsedGeometries, 1);
    meshManager.removeSectorMeshGroup(1);

    // Mesh group should be cleared but texture not disposed (managed by cache)
    expect(meshGroup.children.length).toBe(0);
    expect(textureSpy).not.toHaveBeenCalled();
  });

  test('should set up mesh onBeforeRender callback when material has inverseModelMatrix uniform', () => {
    const geometry = createBasicGeometry();
    const parsedGeometries = [createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry)];

    const result = meshManager.createMeshesFromParsedGeometries(parsedGeometries, 1);
    const mesh = getMeshFromGroup(result, 0);

    expect(mesh.onBeforeRender).toBeDefined();
    expect(typeof mesh.onBeforeRender).toBe('function');
  });

  test('should handle textured materials without errors', () => {
    const geometry = createBasicGeometry();
    const texture = createTexture();
    const sectorId = 42;
    const parsedGeometries = [
      createParsedGeometry(RevealGeometryCollectionType.TexturedTriangleMesh, geometry, texture)
    ];

    // Should not throw when creating textured materials
    expect(() => meshManager.createMeshesFromParsedGeometries(parsedGeometries, sectorId)).not.toThrow();
  });

  test('should handle basic materials without errors', () => {
    const geometry = createBasicGeometry();
    const parsedGeometries = [createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry)];

    // Should not throw when creating basic materials
    expect(() => meshManager.createMeshesFromParsedGeometries(parsedGeometries, 1)).not.toThrow();
  });

  test('should update tree index to sectors map when creating meshes', () => {
    const treeIndices = [10, 20, 30];
    const vertices = [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1];
    const geometry = createBasicGeometry(vertices, treeIndices);
    const parsedGeometries = [createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry)];
    const sectorId = 42;

    meshManager.createMeshesFromParsedGeometries(parsedGeometries, sectorId);

    // Verify tree indices are mapped to the correct sector
    expect(Array.from(treeIndexToSectorsMap.getSectorIdsForTreeIndex(10))).toContain(sectorId);
    expect(Array.from(treeIndexToSectorsMap.getSectorIdsForTreeIndex(20))).toContain(sectorId);
    expect(Array.from(treeIndexToSectorsMap.getSectorIdsForTreeIndex(30))).toContain(sectorId);

    // Verify sector is marked as completed for triangle mesh geometry
    expect(treeIndexToSectorsMap.isCompleted(sectorId, RevealGeometryCollectionType.TriangleMesh)).toBe(true);
  });

  test('should not update tree index mapping when group has multiple children', () => {
    const geometry1 = createBasicGeometry([0, 0, 0, 1, 0, 0, 0, 1, 0], [10]);
    const geometry2 = createBasicGeometry([1, 0, 0, 2, 0, 0, 1, 1, 0], [20]);
    const parsedGeometries = [
      createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry1),
      createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry2)
    ];
    const sectorId = 43;

    meshManager.createMeshesFromParsedGeometries(parsedGeometries, sectorId);

    // Should not have updated tree index mapping because group has 2 children
    expect(Array.from(treeIndexToSectorsMap.getSectorIdsForTreeIndex(10))).not.toContain(sectorId);
    expect(Array.from(treeIndexToSectorsMap.getSectorIdsForTreeIndex(20))).not.toContain(sectorId);
    expect(treeIndexToSectorsMap.isCompleted(sectorId, RevealGeometryCollectionType.TriangleMesh)).toBe(false);
  });

  test('should not update tree index mapping when mesh has no tree indices', () => {
    const geometry = createBasicGeometry(); // No tree indices
    const parsedGeometries = [createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry)];
    const sectorId = 44;

    meshManager.createMeshesFromParsedGeometries(parsedGeometries, sectorId);

    // Should not have updated tree index mapping because no tree indices
    expect(treeIndexToSectorsMap.isCompleted(sectorId, RevealGeometryCollectionType.TriangleMesh)).toBe(false);
  });

  test('should skip tree index mapping update if sector already completed', () => {
    const treeIndices = [50, 60];
    const geometry = createBasicGeometry([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0], treeIndices);
    const parsedGeometries = [createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry)];
    const sectorId = 45;

    // Pre-mark the sector as completed
    treeIndexToSectorsMap.markCompleted(sectorId, RevealGeometryCollectionType.TriangleMesh);

    meshManager.createMeshesFromParsedGeometries(parsedGeometries, sectorId);

    // Tree indices should not be mapped because sector was already completed
    expect(Array.from(treeIndexToSectorsMap.getSectorIdsForTreeIndex(50))).not.toContain(sectorId);
    expect(Array.from(treeIndexToSectorsMap.getSectorIdsForTreeIndex(60))).not.toContain(sectorId);
  });
});

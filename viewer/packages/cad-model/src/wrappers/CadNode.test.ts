/*!
 * Copyright 2025 Cognite AS
 */
import { CadNode } from './CadNode';
import { Matrix4, BufferGeometry, BufferAttribute, Box3, Vector3, CanvasTexture, Mesh, Plane } from 'three';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import { ParsedMeshGeometry, WantedSector } from '@reveal/cad-parsers';
import { AutoDisposeGroup } from '@reveal/utilities';

import { jest } from '@jest/globals';
import { createCadNode } from '../../../../test-utilities/src/createCadNode';
import { SectorRepository } from '@reveal/sector-loader';
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

const expectMeshGroup = (result: AutoDisposeGroup, expectedChildCount: number) => {
  expect(result).toBeDefined();
  expect(result.children.length).toBe(expectedChildCount);
  if (expectedChildCount > 0) {
    result.children.forEach(child => {
      expect(child.type).toBe('Mesh');
    });
  }
};

const createTestMeshGroup = (cadNode: CadNode, sectorId: number, vertices?: number[]) => {
  const geometry = createBasicGeometry(vertices);
  const parsedGeometries = [createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry)];
  return cadNode.createMeshesFromParsedGeometries(parsedGeometries, sectorId);
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

describe(CadNode.name, () => {
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
    const geometry = createBasicGeometry(undefined, [1, 1, 2]);
    const parsedGeometries = [createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry)];

    const result = cadNode.createMeshesFromParsedGeometries(parsedGeometries, 1);

    expectMeshGroup(result, 1);
  });

  test('should create meshes from parsed geometries with textured triangle mesh', () => {
    const cadNode = createCadNode(3, 3);
    const geometry = createBasicGeometry(undefined, [1, 1, 2]);
    const texture = createTexture();
    const parsedGeometries = [
      createParsedGeometry(RevealGeometryCollectionType.TexturedTriangleMesh, geometry, texture)
    ];

    const result = cadNode.createMeshesFromParsedGeometries(parsedGeometries, 1);

    expectMeshGroup(result, 1);
  });

  test('should handle mixed geometry types in createMeshesFromParsedGeometries', () => {
    const cadNode = createCadNode(3, 3);
    const geometry1 = createBasicGeometry(undefined, [1, 1, 2]);
    const geometry2 = createBasicGeometry([0, 0, 0, 2, 0, 0, 0, 2, 0], [3, 3, 4]);
    const texture = createTexture(32);

    const parsedGeometries = [
      createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry1),
      createParsedGeometry(RevealGeometryCollectionType.TexturedTriangleMesh, geometry2, texture)
    ];

    const result = cadNode.createMeshesFromParsedGeometries(parsedGeometries, 1);

    expectMeshGroup(result, 2);
  });

  test('should create empty group when no geometries provided', () => {
    const cadNode = createCadNode(3, 3);
    const result = cadNode.createMeshesFromParsedGeometries([], 1);
    expectMeshGroup(result, 0);
  });

  test('should handle geometry without treeIndex attribute', () => {
    const cadNode = createCadNode(3, 3);
    const geometry = createBasicGeometry(); // No treeIndices parameter = no treeIndex attribute
    const parsedGeometries = [createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry)];

    const result = cadNode.createMeshesFromParsedGeometries(parsedGeometries, 1);

    expectMeshGroup(result, 1);
    const mesh = getMeshFromGroup(result, 0);
    expect(mesh.userData.treeIndices).toEqual(new Map());
  });

  test('should skip textured geometry without texture', () => {
    const cadNode = createCadNode(3, 3);
    const geometry = createBasicGeometry();

    // Create textured geometry without texture property in a type-safe way
    const parsedGeometries: ParsedMeshGeometry[] = [
      {
        type: RevealGeometryCollectionType.TexturedTriangleMesh,
        geometryBuffer: geometry,
        wholeSectorBoundingBox: new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1))
      }
    ];

    const result = cadNode.createMeshesFromParsedGeometries(parsedGeometries, 1);

    expectMeshGroup(result, 0); // Should skip geometry without texture
  });

  test('should properly access model appearance and transform providers with new identifier format', () => {
    const cadNode = createCadNode(3, 3);

    expect(cadNode.nodeAppearanceProvider).toBeDefined();
    expect(cadNode.nodeTransformProvider).toBeDefined();
    expect(cadNode.defaultNodeAppearance).toBeDefined();
    expect(Array.isArray(cadNode.clippingPlanes)).toBe(true);
  });

  test('should create tree index set with proper counting', () => {
    const cadNode = createCadNode(3, 3);
    const vertices = [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1];
    const treeIndices = [1, 1, 2, 2, 2, 3];
    const geometry = createBasicGeometry(vertices, treeIndices);
    const parsedGeometries = [createParsedGeometry(RevealGeometryCollectionType.TriangleMesh, geometry)];

    const result = cadNode.createMeshesFromParsedGeometries(parsedGeometries, 1);
    const mesh = getMeshFromGroup(result, 0);
    const treeIndexSet = mesh.userData.treeIndices;

    expect(treeIndexSet.get(1)).toBe(2);
    expect(treeIndexSet.get(2)).toBe(3);
    expect(treeIndexSet.get(3)).toBe(1);
  });

  test('should remove sector mesh group when sector is unloaded', () => {
    const cadNode = createCadNode(3, 3);
    const sectorId = 123;
    const meshGroup = createTestMeshGroup(cadNode, sectorId);

    expectMeshGroup(meshGroup, 1);

    cadNode.removeSectorMeshGroup(sectorId);
    expect(meshGroup.children.length).toBe(0); // AutoDisposeGroup clears children on dispose
  });

  test('should handle multiple sector mesh groups independently', () => {
    const cadNode = createCadNode(3, 3);
    const meshGroup1 = createTestMeshGroup(cadNode, 100);
    const meshGroup2 = createTestMeshGroup(cadNode, 200, [2, 2, 2, 3, 2, 2, 2, 3, 2]);

    expect(meshGroup1.children.length).toBe(1);
    expect(meshGroup2.children.length).toBe(1);

    cadNode.removeSectorMeshGroup(100);
    expect(meshGroup1.children.length).toBe(0);
    expect(meshGroup2.children.length).toBe(1);

    cadNode.removeSectorMeshGroup(200);
    expect(meshGroup2.children.length).toBe(0);
  });

  test('should replace existing mesh group when sector is updated', () => {
    const cadNode = createCadNode(3, 3);
    const sectorId = 150;

    const firstGroup = createTestMeshGroup(cadNode, sectorId);
    expect(firstGroup.children.length).toBe(1);

    const secondGroup = createTestMeshGroup(cadNode, sectorId, [2, 2, 2, 3, 2, 2, 2, 3, 2]);
    expect(firstGroup.children.length).toBe(0); // First group should be disposed
    expect(secondGroup.children.length).toBe(1); // Second group should be active
    expect(secondGroup).not.toBe(firstGroup);
  });

  test('should clean up all mesh groups on dispose', () => {
    const cadNode = createCadNode(3, 3);

    const group1 = createTestMeshGroup(cadNode, 1);
    const group2 = createTestMeshGroup(cadNode, 2);
    const group3 = createTestMeshGroup(cadNode, 3);

    expect(group1.children.length).toBe(1);
    expect(group2.children.length).toBe(1);
    expect(group3.children.length).toBe(1);

    cadNode.dispose();

    expect(group1.children.length).toBe(0);
    expect(group2.children.length).toBe(0);
    expect(group3.children.length).toBe(0);
  });

  test('needsRedraw getter returns correct redraw state', () => {
    const cadNode = createCadNode();

    // Initially should not need redraw
    expect(cadNode.needsRedraw).toBe(false);

    // After transformation change, should need redraw
    cadNode.setModelTransformation(new Matrix4().makeRotationY(Math.PI / 4));
    expect(cadNode.needsRedraw).toBe(true);
  });

  test('resetRedraw method resets redraw state', () => {
    const cadNode = createCadNode();

    // Set up a state where redraw is needed
    cadNode.setModelTransformation(new Matrix4().makeRotationY(Math.PI / 4));
    expect(cadNode.needsRedraw).toBe(true);

    // Reset redraw state
    cadNode.resetRedraw();
    expect(cadNode.needsRedraw).toBe(false);
  });

  test('defaultNodeAppearance getter returns default appearance', () => {
    const cadNode = createCadNode();

    const defaultAppearance = cadNode.defaultNodeAppearance;
    expect(defaultAppearance).toBeDefined();
  });

  test('defaultNodeAppearance setter updates appearance and triggers render layer update', () => {
    const cadNode = createCadNode();
    const setModelRenderLayersSpy = jest.spyOn(cadNode, 'setModelRenderLayers');

    const newAppearance = { renderGhosted: true, visible: true };
    cadNode.defaultNodeAppearance = newAppearance;

    expect(setModelRenderLayersSpy).toHaveBeenCalled();
  });

  test('clippingPlanes getter returns current clipping planes', () => {
    const cadNode = createCadNode();

    const clippingPlanes = cadNode.clippingPlanes;
    expect(Array.isArray(clippingPlanes)).toBe(true);
  });

  test('clippingPlanes setter updates clipping planes', () => {
    const cadNode = createCadNode();
    const testPlanes = [new Plane(), new Plane()];

    cadNode.clippingPlanes = testPlanes;

    const retrievedPlanes = cadNode.clippingPlanes;
    expect(retrievedPlanes).toEqual(testPlanes);
  });

  test('rootSector getter returns root sector node', () => {
    const cadNode = createCadNode();

    const rootSector = cadNode.rootSector;
    expect(rootSector).toBeDefined();
    expect(rootSector.type).toBeDefined(); // RootSectorNode should have a type
  });

  test('isDisposed getter returns disposal state', () => {
    const cadNode = createCadNode();

    // Initially not disposed
    expect(cadNode.isDisposed).toBe(false);

    // After disposal
    cadNode.dispose();
    expect(cadNode.isDisposed).toBe(true);
  });

  test('loadSector method delegates to sector repository', async () => {
    const mockLoadSector = jest.fn();
    const sectorRepositoryMock = new Mock<SectorRepository>()
      .setup(p => p.loadSector)
      .returns(mockLoadSector as any)
      .setup(p => p.clearCache)
      .returns(jest.fn())
      .object();

    const cadNode = createCadNode(3, 3, { sectorRepository: sectorRepositoryMock });
    const wantedSector = {} as WantedSector;
    const abortSignal = new AbortController().signal;

    cadNode.loadSector(wantedSector, abortSignal);

    expect(mockLoadSector).toHaveBeenCalledWith(wantedSector, abortSignal);
  });

  test('loadSector method works without abort signal', async () => {
    const mockLoadSector = jest.fn();
    const sectorRepositoryMock = new Mock<SectorRepository>()
      .setup(p => p.loadSector)
      .returns(mockLoadSector as any)
      .setup(p => p.clearCache)
      .returns(jest.fn())
      .object();

    const cadNode = createCadNode(3, 3, { sectorRepository: sectorRepositoryMock });
    const wantedSector = {} as WantedSector;

    cadNode.loadSector(wantedSector);

    expect(mockLoadSector).toHaveBeenCalledWith(wantedSector, undefined);
  });
});

/*!
 * Copyright 2022 Cognite AS
 */

import { vi } from 'vitest';
import { Potree } from './Potree';
import { EptLoader } from './loading/EptLoader';
import type { MetadataWithSignedFiles, ModelDataProvider, ModelIdentifier } from '@reveal/data-providers';
import { CdfModelIdentifier } from '@reveal/data-providers';
import type { PointCloudMaterialManager } from '@reveal/rendering';
import { MAX_NUM_NODES_LOADING, PointCloudMaterial } from '@reveal/rendering';
import type { EptJson } from './loading/EptJson';
import { createMockEptGeometry } from '../../../../test-utilities/src/createMockEptGeometry';
import { PointCloudOctree } from './tree/PointCloudOctree';
import { PointCloudOctreeNode } from './tree/PointCloudOctreeNode';
import type { IPointCloudTreeGeometry } from './geometry/IPointCloudTreeGeometry';
import type { IPointCloudTreeGeometryNode } from './geometry/IPointCloudTreeGeometryNode';
import type { IPointCloudTreeNode } from './tree/IPointCloudTreeNode';
import type { IPotree } from './types/IPotree';
import type { WebGLRenderer } from 'three';
import { Box3, BufferGeometry, PerspectiveCamera, Points, Sphere, Vector2, Vector3 } from 'three';

import { It, Mock } from 'moq.ts';
import { mockDMModelIdentifier } from '../../../../test-utilities';

const mockModelDataProvider = new Mock<ModelDataProvider>().object();
const mockMaterialManager = new Mock<PointCloudMaterialManager>()
  .setup(p => p.getModelMaterial(It.IsAny()))
  .returns(new Mock<PointCloudMaterial>().object())
  .object();

const mockFileData = new Mock<EptJson>().object();

const mockPreloadedEptData = new Mock<MetadataWithSignedFiles<EptJson>>()
  .setup(p => p.fileData)
  .returns(mockFileData)
  .setup(p => p.signedFiles)
  .returns({ items: [] })
  .object();

describe(Potree.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Setting and getting point budget works', () => {
    const potreeInstance = new Potree(mockModelDataProvider, mockMaterialManager);

    const budgets = [10_000, 500_000, 2_000_000];

    for (const budget of budgets) {
      potreeInstance.pointBudget = budget;

      expect(potreeInstance.pointBudget).toEqual(budget);
    }
  });

  test('Max nodes loading is set from constant', () => {
    const potreeInstance = new Potree(mockModelDataProvider, mockMaterialManager);

    expect(potreeInstance.maxNumNodesLoading).toEqual(MAX_NUM_NODES_LOADING);
  });

  test('LRU is initialized with point budget', () => {
    const potreeInstance = new Potree(mockModelDataProvider, mockMaterialManager);

    expect(potreeInstance.lru.pointBudget).toBe(potreeInstance.pointBudget);
  });

  test('Changing point budget updates LRU budget', () => {
    const potreeInstance = new Potree(mockModelDataProvider, mockMaterialManager);

    const newBudget = 1_000_000;
    potreeInstance.pointBudget = newBudget;

    expect(potreeInstance.lru.pointBudget).toBe(newBudget);
  });

  test.each<[string, ModelIdentifier, MetadataWithSignedFiles<EptJson> | undefined, 'load' | 'dmsLoad']>([
    ['DM model with preloaded data uses dmsLoad', mockDMModelIdentifier, mockPreloadedEptData, 'dmsLoad'],
    ['DM model without preloaded data uses load', mockDMModelIdentifier, undefined, 'load'],
    ['classic model with preloaded data still uses load', new CdfModelIdentifier(10, 20), mockPreloadedEptData, 'load']
  ])('loadPointCloud(): %s', async (_, modelIdentifier, data, expectedMethod) => {
    const potreeInstance = new Potree(mockModelDataProvider, mockMaterialManager);
    const geometry = createMockEptGeometry();
    const loadSpy = vi.spyOn(EptLoader, 'load').mockResolvedValue(geometry);
    const dmsLoadSpy = vi.spyOn(EptLoader, 'dmsLoad').mockResolvedValue(geometry);

    const octree = await potreeInstance.loadPointCloud(
      'https://base',
      'ept.json',
      [],
      modelIdentifier,
      'https://signed',
      data
    );

    const [usedSpy, unusedSpy] = expectedMethod === 'dmsLoad' ? [dmsLoadSpy, loadSpy] : [loadSpy, dmsLoadSpy];
    expect(usedSpy).toHaveBeenCalledTimes(1);
    expect(unusedSpy).not.toHaveBeenCalled();
    expect(octree.pcoGeometry).toBe(geometry);
  });
});

describe('LOD dithering near the point budget', () => {
  const POINTS_PER_CHILD = 1000;
  const POINT_BUDGET = 3500;
  const LOD_DITHER_BAND = 0.5; // dithering starts at 3500 * (1 - 0.5) = 1750 points

  let nextNodeId = 0;

  function createTreeNode(name: string, index: number, numPoints: number, children: PointCloudOctreeNode[] = []) {
    const geometryNode = new Mock<IPointCloudTreeGeometryNode>()
      .setup(g => g.id)
      .returns(nextNodeId++)
      .setup(g => g.name)
      .returns(name)
      .setup(g => g.level)
      .returns(name.length - 1)
      .setup(g => g.index)
      .returns(index)
      .setup(g => g.numPoints)
      .returns(numPoints)
      .setup(g => g.isLeafNode)
      .returns(children.length === 0)
      .setup(g => g.spacing)
      .returns(1)
      .setup(g => g.boundingBox)
      .returns(new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1)))
      .setup(g => g.boundingSphere)
      .returns(new Sphere(new Vector3(0, 0, 0), 1))
      .setup(g => g.children)
      .returns(children)
      .object();

    return new PointCloudOctreeNode(geometryNode, new Points(new BufferGeometry()));
  }

  function createOctree(root: PointCloudOctreeNode): PointCloudOctree {
    const geometry = new Mock<IPointCloudTreeGeometry>()
      .setup(g => g.root)
      .returns(root)
      .setup(g => g.boundingBox)
      .returns(new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1)))
      .setup(g => g.tightBoundingBox)
      .returns(new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1)))
      .setup(g => g.offset)
      .returns(new Vector3(0, 0, 0))
      .setup(g => g.spacing)
      .returns(1)
      .object();

    const octree = new PointCloudOctree(new Mock<IPotree>().object(), geometry, new PointCloudMaterial());
    octree.minNodePixelSize = 0;
    return octree;
  }

  function updateVisibility(potree: Potree, octree: PointCloudOctree): void {
    const camera = new PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.set(0, 0, 10);

    const renderer = new Mock<WebGLRenderer>()
      .setup(r => r.getSize(It.IsAny()))
      .returns(new Vector2(200, 200))
      .setup(r => r.getPixelRatio())
      .returns(1)
      .object();

    potree.pointBudget = POINT_BUDGET;
    potree.updatePointClouds([octree], camera, renderer);
  }

  function createTree(childCount: number): { octree: PointCloudOctree; children: PointCloudOctreeNode[] } {
    const children = Array.from({ length: childCount }, (_, index) =>
      createTreeNode(`r${index}`, index, POINTS_PER_CHILD)
    );
    return { octree: createOctree(createTreeNode('r', 0, 0, children)), children };
  }

  // The octree re-sorts its visible nodes for the GPU visibility texture, and same-priority
  // siblings pop in no guaranteed order, so assert on the set of fractions rather than on
  // which sibling received which one.
  function visibleKeepFractions(octree: PointCloudOctree, children: IPointCloudTreeNode[]): number[] {
    return octree.visibleNodes
      .filter(node => children.includes(node))
      .map(node => node.keepFraction)
      .sort((a, b) => a - b);
  }

  test('shrinks nodes inside the dither band and drops nodes that exceed the budget', () => {
    const potree = new Potree(mockModelDataProvider, mockMaterialManager, LOD_DITHER_BAND);
    const { octree, children } = createTree(4);

    updateVisibility(potree, octree);

    // Running totals of 1000, 2000 and 3000 points: the first is below the band, the others
    // ramp down linearly towards the budget. A fourth node (4000) would exceed the budget.
    const keepFractions = visibleKeepFractions(octree, children);
    expect(keepFractions).toHaveLength(3);
    expect(keepFractions[0]).toBeCloseTo(2 / 7);
    expect(keepFractions[1]).toBeCloseTo(6 / 7);
    expect(keepFractions[2]).toBe(1);
  });

  test('keeps every node whole when the visible set fits below the dither band', () => {
    const potree = new Potree(mockModelDataProvider, mockMaterialManager, LOD_DITHER_BAND);
    const { octree, children } = createTree(1);

    updateVisibility(potree, octree);

    expect(visibleKeepFractions(octree, children)).toEqual([1]);
  });

  test('does not dither by default, keeping the hard budget cutoff', () => {
    const potree = new Potree(mockModelDataProvider, mockMaterialManager);
    const { octree, children } = createTree(4);

    updateVisibility(potree, octree);

    expect(visibleKeepFractions(octree, children)).toEqual([1, 1, 1]);
  });
});

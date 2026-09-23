/*!
 * Copyright 2022 Cognite AS
 */

import { vi } from 'vitest';
import { Potree } from './Potree';
import { EptLoader } from './loading/EptLoader';
import type { MetadataWithSignedFiles, ModelDataProvider, ModelIdentifier } from '@reveal/data-providers';
import { CdfModelIdentifier } from '@reveal/data-providers';
import type { PointCloudMaterial, PointCloudMaterialManager } from '@reveal/rendering';
import { MAX_NUM_NODES_LOADING } from '@reveal/rendering';
import type { EptJson } from './loading/EptJson';
import { createMockEptGeometry } from '../../../../test-utilities/src/createMockEptGeometry';
import { PointCloudOctree } from './tree/PointCloudOctree';
import type { IPointCloudTreeNode } from './tree/IPointCloudTreeNode';
import { BufferGeometry, Box3, Frustum, Matrix4, PerspectiveCamera, Points, Sphere, Vector2, Vector3 } from 'three';

import { It, Mock } from 'moq.ts';
import { mockDMModelIdentifier } from '../../../../test-utilities';

vi.mock('@reveal/rendering', async importOriginal => {
  const actual = await importOriginal<typeof import('@reveal/rendering')>();
  return { ...actual, DEFAULT_POINTCLOUD_LOD_DITHER_BAND: 0.5 };
});

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
  let intersectsBoxSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Node placement isn't the point of this test - what matters is which nodes make it into
    // the budget and what keepFraction they get. Force every node through the frustum check.
    intersectsBoxSpy = vi.spyOn(Frustum.prototype, 'intersectsBox').mockReturnValue(true);
  });

  afterEach(() => {
    intersectsBoxSpy.mockRestore();
  });

  function createFakeTreeNode(id: number, name: string, numPoints: number): IPointCloudTreeNode {
    return {
      id,
      name,
      level: 1,
      index: id,
      spacing: 1,
      boundingBox: new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1)),
      boundingSphere: new Sphere(new Vector3(0, 0, 0), 1),
      loaded: true,
      numPoints,
      isTreeNode: true,
      isGeometryNode: false,
      isLeafNode: true,
      children: [],
      sceneNode: new Points(new BufferGeometry()),
      geometryNode: { id, loaded: true, numPoints, dispose: () => {} } as any,
      keepFraction: 1,
      dispose: () => {},
      traverse: () => {}
    };
  }

  function createFakePointCloud(root: IPointCloudTreeNode): PointCloudOctree {
    const pointCloud = Object.create(PointCloudOctree.prototype) as PointCloudOctree;
    pointCloud.matrixWorld = new Matrix4();
    pointCloud.material = {
      heightMin: 0,
      heightMax: 0,
      visibleNodeTextureOffsets: new Map(),
      updateMaterial: () => {}
    } as any;
    pointCloud.pcoGeometry = { boundingBox: new Box3(), spacing: 1 } as any;
    pointCloud.maxLevel = Infinity;
    pointCloud.minNodePixelSize = 0;
    pointCloud.visible = true;
    pointCloud.root = root;
    pointCloud.visibleNodes = [];
    pointCloud.visibleGeometry = [];
    pointCloud.numVisiblePoints = 0;
    // Constructor never ran (it does heavier setup we don't need here), so the private
    // visibleBounds field initializer didn't run either - set it directly.
    (pointCloud as any).visibleBounds = new Box3();
    return pointCloud;
  }

  test('keeps nodes below the dither band whole, shrinks nodes within it, and drops nodes over budget', () => {
    const numChildren = 4;
    const pointsPerChild = 1000;
    const pointBudget = 3500; // softBudgetStart = 3500 * (1 - 0.5) = 1750

    const children = Array.from({ length: numChildren }, (_, i) =>
      createFakeTreeNode(i + 1, `child-${i}`, pointsPerChild)
    );
    const root = createFakeTreeNode(0, 'root', 0);
    (root.children as (IPointCloudTreeNode | null)[]).push(...children);

    const pointCloud = createFakePointCloud(root);

    const potreeInstance = new Potree(mockModelDataProvider, mockMaterialManager);
    potreeInstance.pointBudget = pointBudget;

    const camera = new PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.set(0, 0, 10);
    camera.updateMatrixWorld(true);

    const renderer = new Mock<import('three').WebGLRenderer>()
      .setup(r => r.getSize(It.IsAny()))
      .returns(new Vector2(200, 200))
      .setup(r => r.getPixelRatio())
      .returns(1)
      .object();

    potreeInstance.updatePointClouds([pointCloud], camera, renderer);

    // Root is always kept, but carries no points and is unaffected by the dither band.
    expect(pointCloud.visibleNodes).toContain(root);
    expect(root.keepFraction).toBe(1);

    // pointCloud.visibleNodes gets re-sorted by name/level later in the update (for the GPU
    // visibility texture), so it no longer reflects priority-queue processing order by the
    // time we inspect it here - and priority ties between same-priority siblings aren't
    // deterministic either. So we can't assume which sibling ends up in which position;
    // instead we check the resulting *set* of keepFractions against the same formula the
    // implementation uses, independent of which specific sibling got which slot.
    const visibleChildren = pointCloud.visibleNodes.filter(n => children.includes(n));

    // With a hard budget of 3500 and 1000 points per child, only 3 of the 4 children fit -
    // the 4th would push the running total over budget and must be dropped entirely.
    expect(visibleChildren).toHaveLength(3);
    expect(children.filter(c => !pointCloud.visibleNodes.includes(c))).toHaveLength(1);

    const softBudgetStart = pointBudget * 0.5;
    const expectedKeepFractions = [1, 2, 3]
      .map(admittedCount => admittedCount * pointsPerChild)
      .map(cumulativePoints =>
        cumulativePoints > softBudgetStart
          ? Math.max(0, 1 - (cumulativePoints - softBudgetStart) / (pointBudget - softBudgetStart))
          : 1
      )
      .sort((a, b) => a - b);

    const actualKeepFractions = visibleChildren.map(c => c.keepFraction).sort((a, b) => a - b);
    for (let i = 0; i < expectedKeepFractions.length; i++) {
      expect(actualKeepFractions[i]).toBeCloseTo(expectedKeepFractions[i]);
    }

    // The last admitted child is within the dither band and must be showing a shrunk fraction.
    expect(actualKeepFractions[0]).toBeLessThan(1);
  });

  test('does not shrink any node when the whole set fits below the dither band', () => {
    const pointBudget = 10_000; // softBudgetStart = 10000 * (1 - 0.5) = 5000, well above 2 * 1000
    const children = [createFakeTreeNode(1, 'child-0', 1000), createFakeTreeNode(2, 'child-1', 1000)];
    const root = createFakeTreeNode(0, 'root', 0);
    (root.children as (IPointCloudTreeNode | null)[]).push(...children);

    const pointCloud = createFakePointCloud(root);

    const potreeInstance = new Potree(mockModelDataProvider, mockMaterialManager);
    potreeInstance.pointBudget = pointBudget;

    const camera = new PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.set(0, 0, 10);
    camera.updateMatrixWorld(true);

    const renderer = new Mock<import('three').WebGLRenderer>()
      .setup(r => r.getSize(It.IsAny()))
      .returns(new Vector2(200, 200))
      .setup(r => r.getPixelRatio())
      .returns(1)
      .object();

    potreeInstance.updatePointClouds([pointCloud], camera, renderer);

    expect(pointCloud.visibleNodes).toHaveLength(3); // root + both children
    for (const child of children) {
      expect(child.keepFraction).toBe(1);
    }
  });
});

import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { type PropsWithChildren, type ReactElement } from 'react';
import { Vector3, MOUSE, Vector2 } from 'three';

import { useClickedNodeData } from './useClickedNode';

import { ViewerContextProvider } from '../components/RevealCanvas/ViewerContext';
import { createFullRenderTargetMock } from '../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { type DataSourceType, type Cognite3DViewer, type CadIntersection } from '@cognite/reveal';
import { type Node3D } from '@cognite/sdk';
import { cadMock } from '#test-utils/fixtures/cadModel';
import { type FdmNodeDataPromises } from '../components/CacheProvider/types';
import { type PointCloudAnnotationMappedAssetData } from './types';
import { type HybridCadNodeAssetMappingResult } from '../components/CacheProvider/cad/ClassicCadAssetMappingCache';
import {
  UseClickedNodeDataContext,
  type UseClickedNodeDataDependencies
} from './useClickedNode.context';
import { type RevealRenderTarget } from '../architecture';
import {
  createMockQueryResult,
  createMockQueryResultNoData
} from '#test-utils/fixtures/queryResult';
import { viewerGetAnyIntersectionFromPixelMock } from '#test-utils/fixtures/viewer';
import { getClickCallback, simulateClick } from '#test-utils/viewerClickHelper/viewerClick';
import { createAssetMock } from '#test-utils/fixtures/assets';
import { type PointCloudFdmVolumeMappingWithViews } from '../query/core-dm/usePointCloudVolumeMappingForAssetInstances';

describe(useClickedNodeData.name, () => {
  let renderTarget: RevealRenderTarget;
  let viewer: Cognite3DViewer<DataSourceType>;
  let mockDependencies: UseClickedNodeDataDependencies;

  const createMockNode3D = (): Node3D => ({
    id: 123,
    name: 'Test Node',
    treeIndex: 456,
    boundingBox: { min: [0, 0, 0], max: [1, 1, 1] },
    parentId: 0,
    depth: 1,
    subtreeSize: 1
  });

  const createMockCadIntersection = (): CadIntersection => ({
    type: 'cad',
    model: cadMock,
    point: new Vector3(1, 2, 3),
    distanceToCamera: 10,
    treeIndex: 123
  });

  const createMockFdmNodeDataPromises = (): FdmNodeDataPromises => ({
    cadAndFdmNodesPromise: Promise.resolve({
      cadNode: createMockNode3D(),
      fdmIds: [{ space: 'test', externalId: 'test-1' }]
    }),
    viewsPromise: Promise.resolve([
      [{ space: 'test', externalId: 'view-1', version: '1', type: 'view' }]
    ])
  });

  const createMockHybridAssetMappingResult = (): HybridCadNodeAssetMappingResult => ({
    node: createMockNode3D(),
    mappings: [
      { assetId: 111, treeIndex: 123, subtreeSize: 1, nodeId: 501 },
      { assetId: 222, treeIndex: 124, subtreeSize: 1, nodeId: 502 }
    ]
  });

  const mockUseFdm3dNodeDataPromises =
    vi.fn<UseClickedNodeDataDependencies['useFdm3dNodeDataPromises']>();
  const mockUseAssetMappingForTreeIndex =
    vi.fn<UseClickedNodeDataDependencies['useAssetMappingForTreeIndex']>();
  const mockUsePointCloudAnnotationMappingForIntersection =
    vi.fn<UseClickedNodeDataDependencies['usePointCloudAnnotationMappingForIntersection']>();
  const mockUsePointCloudFdmVolumeMappingForIntersection =
    vi.fn<UseClickedNodeDataDependencies['usePointCloudFdmVolumeMappingForIntersection']>();
  const mockReveal = vi.fn<UseClickedNodeDataDependencies['useReveal']>();
  const mockIsActiveEditTool = vi.fn<UseClickedNodeDataDependencies['isActiveEditTool']>();
  const mockUseRenderTarget = vi.fn<UseClickedNodeDataDependencies['useRenderTarget']>();

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <ViewerContextProvider value={renderTarget}>
      <UseClickedNodeDataContext.Provider value={mockDependencies}>
        {children}
      </UseClickedNodeDataContext.Provider>
    </ViewerContextProvider>
  );

  beforeEach(() => {
    renderTarget = createFullRenderTargetMock();
    viewer = renderTarget.viewer;
    mockUseRenderTarget.mockReturnValue(renderTarget);
    mockReveal.mockReturnValue(viewer);
    mockIsActiveEditTool.mockReturnValue(false);
    mockUseFdm3dNodeDataPromises.mockReturnValue(
      createMockQueryResultNoData<FdmNodeDataPromises>()
    );
    mockUseAssetMappingForTreeIndex.mockReturnValue(
      createMockQueryResultNoData<HybridCadNodeAssetMappingResult>()
    );
    mockUsePointCloudAnnotationMappingForIntersection.mockReturnValue(
      createMockQueryResultNoData<PointCloudAnnotationMappedAssetData[]>()
    );
    mockUsePointCloudFdmVolumeMappingForIntersection.mockReturnValue(
      createMockQueryResultNoData<PointCloudFdmVolumeMappingWithViews[]>()
    );

    mockDependencies = {
      useFdm3dNodeDataPromises: mockUseFdm3dNodeDataPromises,
      useAssetMappingForTreeIndex: mockUseAssetMappingForTreeIndex,
      usePointCloudAnnotationMappingForIntersection:
        mockUsePointCloudAnnotationMappingForIntersection,
      usePointCloudFdmVolumeMappingForIntersection:
        mockUsePointCloudFdmVolumeMappingForIntersection,
      useRenderTarget: mockUseRenderTarget,
      useReveal: mockReveal,
      isActiveEditTool: mockIsActiveEditTool
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('returns asset mapping result when intersection and data are available', async () => {
    const mockAssetMapping = createMockHybridAssetMappingResult();

    viewerGetAnyIntersectionFromPixelMock.mockResolvedValue(createMockCadIntersection());

    mockUseAssetMappingForTreeIndex.mockReturnValue(createMockQueryResult(mockAssetMapping));

    const { result } = renderHook(() => useClickedNodeData(), { wrapper });

    const clickCallback = getClickCallback(viewer);

    await simulateClick(clickCallback, MOUSE.LEFT);

    await waitFor(async () => {
      expect(result.current).not.toBeUndefined();
      expect(result.current).toEqual({
        mouseButton: MOUSE.LEFT,
        position: new Vector2(100, 200),
        fdmResult: undefined,
        assetMappingResult: {
          cadNode: mockAssetMapping.node,
          assetIds: [111, 222]
        },
        pointCloudAnnotationMappingResult: null,
        pointCloudFdmVolumeMappingResult: null,
        intersection: createMockCadIntersection()
      });
    });
  });

  test('verifies FDM data processing readiness and dependency data structure', async () => {
    const mockFdmPromises = createMockFdmNodeDataPromises();

    viewerGetAnyIntersectionFromPixelMock.mockResolvedValue(createMockCadIntersection());
    mockUseFdm3dNodeDataPromises.mockReturnValue(createMockQueryResult(mockFdmPromises));

    const { result } = renderHook(() => useClickedNodeData(), { wrapper });

    const clickCallback = getClickCallback(viewer);

    await simulateClick(clickCallback, MOUSE.LEFT);

    await waitFor(async () => {
      expect(result.current).not.toBeUndefined();
      expect(result.current).toEqual({
        mouseButton: MOUSE.LEFT,
        position: new Vector2(100, 200),
        fdmResult: {
          fdmNodes: (await mockFdmPromises.cadAndFdmNodesPromise)?.fdmIds,
          cadNode: (await mockFdmPromises.cadAndFdmNodesPromise)?.cadNode,
          views: await mockFdmPromises.viewsPromise
        },
        assetMappingResult: undefined,
        pointCloudAnnotationMappingResult: null,
        pointCloudFdmVolumeMappingResult: null,
        intersection: createMockCadIntersection()
      });
    });
  });

  test('returns point cloud annotation mapping result when intersection and data are available', async () => {
    const mockPointCloudData = [{ annotationId: 1, asset: createAssetMock(333, 'Test Asset') }];

    viewerGetAnyIntersectionFromPixelMock.mockResolvedValue(createMockCadIntersection());

    mockUsePointCloudAnnotationMappingForIntersection.mockReturnValue(
      createMockQueryResult(mockPointCloudData, false)
    );

    const { result } = renderHook(() => useClickedNodeData(), { wrapper });

    const clickCallback = getClickCallback(viewer);

    await simulateClick(clickCallback, MOUSE.LEFT);

    await waitFor(async () => {
      expect(result.current).not.toBeUndefined();
      expect(result.current).toEqual({
        mouseButton: MOUSE.LEFT,
        position: new Vector2(100, 200),
        fdmResult: undefined,
        assetMappingResult: undefined,
        pointCloudAnnotationMappingResult: mockPointCloudData,
        pointCloudFdmVolumeMappingResult: null,
        intersection: createMockCadIntersection()
      });
    });
  });

  test('returns point cloud FDM volume mapping result when intersection and data are available', async () => {
    const mockVolumeData = [
      { assetInstance: { space: 'test', externalId: 'volume-1' }, views: [] }
    ];

    viewerGetAnyIntersectionFromPixelMock.mockResolvedValue(createMockCadIntersection());

    mockUsePointCloudFdmVolumeMappingForIntersection.mockReturnValue(
      createMockQueryResult(mockVolumeData, false)
    );

    const { result } = renderHook(() => useClickedNodeData(), { wrapper });

    const clickCallback = getClickCallback(viewer);

    await simulateClick(clickCallback, MOUSE.LEFT);

    await waitFor(async () => {
      expect(result.current).not.toBeUndefined();
      expect(result.current).toEqual({
        mouseButton: MOUSE.LEFT,
        position: new Vector2(100, 200),
        fdmResult: undefined,
        assetMappingResult: undefined,
        pointCloudAnnotationMappingResult: null,
        pointCloudFdmVolumeMappingResult: mockVolumeData,
        intersection: createMockCadIntersection()
      });
    });
  });

  test('sets up event listeners for 360 annotation intersection handling', async () => {
    const { result } = renderHook(() => useClickedNodeData(), { wrapper });

    expect(viewer.on).toHaveBeenCalledWith('click', expect.any(Function));
    expect(result.current).toBeUndefined();
  });

  test('returns undefined when no intersection data is available', () => {
    const { result } = renderHook(() => useClickedNodeData(), { wrapper });

    expect(result.current).toBeUndefined();
  });

  test('respects leftClick option when provided', async () => {
    viewerGetAnyIntersectionFromPixelMock.mockResolvedValue(createMockCadIntersection());

    const { result } = renderHook(() => useClickedNodeData({ leftClick: false }), { wrapper });

    const clickCallback = getClickCallback(viewer);

    await simulateClick(clickCallback, MOUSE.LEFT);

    expect(result.current).toBeUndefined();
  });

  test('respects rightClick option when provided', async () => {
    viewerGetAnyIntersectionFromPixelMock.mockResolvedValue(createMockCadIntersection());

    const { result } = renderHook(() => useClickedNodeData({ rightClick: true }), { wrapper });

    const clickCallback = getClickCallback(viewer);

    await simulateClick(clickCallback, MOUSE.RIGHT);

    await waitFor(async () => {
      expect(result.current).not.toBeUndefined();
      expect(result.current).toEqual({
        mouseButton: MOUSE.RIGHT,
        position: new Vector2(100, 200),
        fdmResult: undefined,
        assetMappingResult: undefined,
        pointCloudAnnotationMappingResult: null,
        pointCloudFdmVolumeMappingResult: null,
        intersection: createMockCadIntersection()
      });
    });
  });

  test('respects disableOnEditTool option when provided', async () => {
    viewerGetAnyIntersectionFromPixelMock.mockResolvedValue(createMockCadIntersection());
    mockDependencies.isActiveEditTool = vi.fn().mockReturnValue(true);

    const { result } = renderHook(() => useClickedNodeData({ disableOnEditTool: true }), {
      wrapper
    });

    const clickCallback = getClickCallback(viewer);

    await simulateClick(clickCallback, MOUSE.LEFT);

    expect(result.current).toBeUndefined();
  });

  test('returns undefined when no intersection occurs', async () => {
    viewerGetAnyIntersectionFromPixelMock.mockResolvedValue(undefined);
    vi.mocked(viewer.get360AnnotationIntersectionFromPixel).mockResolvedValue(null);

    const { result } = renderHook(() => useClickedNodeData(), { wrapper });

    const clickCallback = getClickCallback(viewer);

    await simulateClick(clickCallback, MOUSE.LEFT);

    expect(result.current).toBeUndefined();
  });
});

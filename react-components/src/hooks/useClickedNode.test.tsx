import { describe, expect, test, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { type PropsWithChildren, type ReactElement } from 'react';
import { Vector3, MOUSE, Vector2 } from 'three';

import { useClickedNodeData } from './useClickedNode';

import { ViewerContextProvider } from '../components/RevealCanvas/ViewerContext';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
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

  const mockNode3D: Node3D = {
    id: 123,
    name: 'Test Node',
    treeIndex: 456,
    boundingBox: { min: [0, 0, 0], max: [1, 1, 1] },
    parentId: 0,
    depth: 1,
    subtreeSize: 1
  };

  const mockCadIntersection: CadIntersection = {
    type: 'cad',
    model: cadMock,
    point: new Vector3(1, 2, 3),
    distanceToCamera: 10,
    treeIndex: 123
  };

  const mockFdmNodeDataPromises: FdmNodeDataPromises = {
    cadAndFdmNodesPromise: Promise.resolve({
      cadNode: mockNode3D,
      fdmIds: [{ space: 'test', externalId: 'test-1' }]
    }),
    viewsPromise: Promise.resolve([
      [{ space: 'test', externalId: 'view-1', version: '1', type: 'view' }]
    ])
  };

  const mockHybridAssetMappingResult: HybridCadNodeAssetMappingResult = {
    node: mockNode3D,
    mappings: [
      { assetId: 111, treeIndex: 123, subtreeSize: 1, nodeId: 501 },
      { assetId: 222, treeIndex: 124, subtreeSize: 1, nodeId: 502 }
    ]
  };

  const mockScreenPositionOnClick = new Vector2(100, 200);

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
    <ViewerContextProvider renderTarget={renderTarget}>
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

  test('returns asset mapping result when intersection and data are available', async () => {
    viewerGetAnyIntersectionFromPixelMock.mockResolvedValue(mockCadIntersection);

    mockUseAssetMappingForTreeIndex.mockReturnValue(
      createMockQueryResult(mockHybridAssetMappingResult)
    );

    const { result } = renderHook(() => useClickedNodeData(), { wrapper });

    const clickCallback = getClickCallback(viewer);

    await simulateClick(
      clickCallback,
      MOUSE.LEFT,
      mockScreenPositionOnClick.x,
      mockScreenPositionOnClick.y
    );

    await waitFor(async () => {
      expect(result.current).not.toBeUndefined();
      expect(result.current).toEqual({
        mouseButton: MOUSE.LEFT,
        position: mockScreenPositionOnClick,
        fdmResult: undefined,
        assetMappingResult: {
          cadNode: mockHybridAssetMappingResult.node,
          assetIds: [111, 222]
        },
        pointCloudAnnotationMappingResult: null,
        pointCloudFdmVolumeMappingResult: null,
        intersection: mockCadIntersection
      });
    });
  });

  test('verifies FDM data processing readiness and dependency data structure', async () => {
    viewerGetAnyIntersectionFromPixelMock.mockResolvedValue(mockCadIntersection);
    mockUseFdm3dNodeDataPromises.mockReturnValue(createMockQueryResult(mockFdmNodeDataPromises));

    const { result } = renderHook(() => useClickedNodeData(), { wrapper });

    const clickCallback = getClickCallback(viewer);

    await simulateClick(
      clickCallback,
      MOUSE.LEFT,
      mockScreenPositionOnClick.x,
      mockScreenPositionOnClick.y
    );

    await waitFor(async () => {
      expect(result.current).not.toBeUndefined();
      expect(result.current).toEqual({
        mouseButton: MOUSE.LEFT,
        position: mockScreenPositionOnClick,
        fdmResult: {
          fdmNodes: (await mockFdmNodeDataPromises.cadAndFdmNodesPromise)?.fdmIds,
          cadNode: (await mockFdmNodeDataPromises.cadAndFdmNodesPromise)?.cadNode,
          views: await mockFdmNodeDataPromises.viewsPromise
        },
        assetMappingResult: undefined,
        pointCloudAnnotationMappingResult: null,
        pointCloudFdmVolumeMappingResult: null,
        intersection: mockCadIntersection
      });
    });
  });

  test('returns point cloud annotation mapping result when intersection and data are available', async () => {
    const mockPointCloudData = [{ annotationId: 1, asset: createAssetMock(333, 'Test Asset') }];

    viewerGetAnyIntersectionFromPixelMock.mockResolvedValue(mockCadIntersection);

    mockUsePointCloudAnnotationMappingForIntersection.mockReturnValue(
      createMockQueryResult(mockPointCloudData, false)
    );

    const { result } = renderHook(() => useClickedNodeData(), { wrapper });

    const clickCallback = getClickCallback(viewer);

    await simulateClick(
      clickCallback,
      MOUSE.LEFT,
      mockScreenPositionOnClick.x,
      mockScreenPositionOnClick.y
    );

    await waitFor(async () => {
      expect(result.current).not.toBeUndefined();
      expect(result.current).toEqual({
        mouseButton: MOUSE.LEFT,
        position: mockScreenPositionOnClick,
        fdmResult: undefined,
        assetMappingResult: undefined,
        pointCloudAnnotationMappingResult: mockPointCloudData,
        pointCloudFdmVolumeMappingResult: null,
        intersection: mockCadIntersection
      });
    });
  });

  test('returns point cloud FDM volume mapping result when intersection and data are available', async () => {
    const mockVolumeData = [
      { assetInstance: { space: 'test', externalId: 'volume-1' }, views: [] }
    ];

    viewerGetAnyIntersectionFromPixelMock.mockResolvedValue(mockCadIntersection);

    mockUsePointCloudFdmVolumeMappingForIntersection.mockReturnValue(
      createMockQueryResult(mockVolumeData, false)
    );

    const { result } = renderHook(() => useClickedNodeData(), { wrapper });

    const clickCallback = getClickCallback(viewer);

    await simulateClick(
      clickCallback,
      MOUSE.LEFT,
      mockScreenPositionOnClick.x,
      mockScreenPositionOnClick.y
    );

    await waitFor(async () => {
      expect(result.current).not.toBeUndefined();
      expect(result.current).toEqual({
        mouseButton: MOUSE.LEFT,
        position: mockScreenPositionOnClick,
        fdmResult: undefined,
        assetMappingResult: undefined,
        pointCloudAnnotationMappingResult: null,
        pointCloudFdmVolumeMappingResult: mockVolumeData,
        intersection: mockCadIntersection
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

  test('do nothing when left click is false', async () => {
    viewerGetAnyIntersectionFromPixelMock.mockResolvedValue(mockCadIntersection);

    const { result } = renderHook(() => useClickedNodeData({ leftClick: false }), { wrapper });

    const clickCallback = getClickCallback(viewer);

    await simulateClick(
      clickCallback,
      MOUSE.LEFT,
      mockScreenPositionOnClick.x,
      mockScreenPositionOnClick.y
    );

    expect(result.current).toBeUndefined();
  });

  test('returns intersection data for right-click events when rightClick option is true', async () => {
    viewerGetAnyIntersectionFromPixelMock.mockResolvedValue(mockCadIntersection);

    const { result } = renderHook(() => useClickedNodeData({ rightClick: true }), { wrapper });

    const clickCallback = getClickCallback(viewer);

    await simulateClick(
      clickCallback,
      MOUSE.RIGHT,
      mockScreenPositionOnClick.x,
      mockScreenPositionOnClick.y
    );

    await waitFor(async () => {
      expect(result.current).not.toBeUndefined();
      expect(result.current).toEqual({
        mouseButton: MOUSE.RIGHT,
        position: mockScreenPositionOnClick,
        fdmResult: undefined,
        assetMappingResult: undefined,
        pointCloudAnnotationMappingResult: null,
        pointCloudFdmVolumeMappingResult: null,
        intersection: mockCadIntersection
      });
    });
  });

  test('do nothing when disableOnEditTool option is true', async () => {
    viewerGetAnyIntersectionFromPixelMock.mockResolvedValue(mockCadIntersection);
    mockDependencies.isActiveEditTool = vi.fn().mockReturnValue(true);

    const { result } = renderHook(() => useClickedNodeData({ disableOnEditTool: true }), {
      wrapper
    });

    const clickCallback = getClickCallback(viewer);

    await simulateClick(
      clickCallback,
      MOUSE.LEFT,
      mockScreenPositionOnClick.x,
      mockScreenPositionOnClick.y
    );

    expect(result.current).toBeUndefined();
  });

  test('returns undefined when no intersection occurs', async () => {
    viewerGetAnyIntersectionFromPixelMock.mockResolvedValue(undefined);
    vi.mocked(viewer.get360AnnotationIntersectionFromPixel).mockResolvedValue(null);

    const { result } = renderHook(() => useClickedNodeData(), { wrapper });

    const clickCallback = getClickCallback(viewer);

    await simulateClick(
      clickCallback,
      MOUSE.LEFT,
      mockScreenPositionOnClick.x,
      mockScreenPositionOnClick.y
    );

    expect(result.current).toBeUndefined();
  });
});

import { describe, expect, beforeEach, test, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactElement, type ReactNode } from 'react';
import {
  usePointCloudDMVolumeMappingForAssetInstances,
  usePointCloudFdmVolumeMappingForIntersection
} from './usePointCloudDMVolumeMappingForAssetInstances';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import {
  defaultUsePointCloudDMVolumeMappingForAssetInstancesDependencies,
  UsePointCloudDMVolumeMappingForAssetInstancesContext,
  type UsePointCloudDMVolumeMappingForAssetInstancesDependencies
} from './usePointCloudDMVolumeMappingForAssetInstances.context';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { type DMVolumeModelDataResult } from '../../components/Reveal3DResources/types';
import { type PointCloudVolumeWithAsset } from '../../components/CacheProvider/types';
import { Mock } from 'moq.ts';
import {
  createMockQueryResult,
  createMockQueryResultNoData
} from '#test-utils/fixtures/queryResult';
import { type PointCloudModelRevisionIdAndType } from '../usePointCloudModelRevisionIdsFromReveal';
import {
  type AnyIntersection,
  type PointCloudIntersection,
  type DMDataSourceType,
  type CognitePointCloudModel
} from '@cognite/reveal';
import { Vector3 } from 'three';
import { type FdmSDK, type Source } from '../../data-providers/FdmSDK';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createPointCloudDMMock } from '#test-utils/fixtures/pointCloud';
import { createCadMock } from '#test-utils/fixtures/cadModel';

describe(usePointCloudDMVolumeMappingForAssetInstances.name, () => {
  const dependencies = getMocksByDefaultDependencies(
    defaultUsePointCloudDMVolumeMappingForAssetInstancesDependencies
  );

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <UsePointCloudDMVolumeMappingForAssetInstancesContext.Provider value={dependencies}>
      {children}
    </UsePointCloudDMVolumeMappingForAssetInstancesContext.Provider>
  );

  const classicModelOptions: PointCloudModelRevisionIdAndType = {
    modelId: 123,
    revisionId: 456,
    type: 'pointcloud'
  };

  const classicModelOptions2: PointCloudModelRevisionIdAndType = {
    modelId: 789,
    revisionId: 321,
    type: 'pointcloud'
  };

  const assetInstance1: DmsUniqueIdentifier = {
    externalId: 'test-external-id-1',
    space: 'test-space'
  };

  const assetInstance2: DmsUniqueIdentifier = {
    externalId: 'test-external-id-2',
    space: 'test-space'
  };

  const volumeWithAsset1 = createPointCloudVolumeWithAsset({
    externalId: 'test-volume-external-id-1',
    space: 'test-space',
    dmAsset: {
      externalId: 'test-external-id-1',
      space: 'test-space',
      name: 'Asset 1',
      description: '',
      object3D: {
        externalId: 'test-object-external-id-1',
        space: 'test-space'
      }
    }
  });

  const volumeWithAsset2 = createPointCloudVolumeWithAsset({
    externalId: 'test-volume-external-id-2',
    space: 'test-space',
    dmAsset: {
      externalId: 'test-external-id-2',
      space: 'test-space',
      name: 'Asset 2',
      description: '',
      object3D: {
        externalId: 'test-object-external-id-2',
        space: 'test-space'
      }
    }
  });

  const volumeWithoutAsset = createPointCloudVolumeWithAsset({
    externalId: 'test-volume-external-id-3',
    space: 'test-space',
    dmAsset: undefined
  });

  beforeEach(() => {
    dependencies.usePointCloudModelRevisionIdsFromReveal.mockReturnValue(
      createMockQueryResult([classicModelOptions])
    );
    dependencies.useModelIdRevisionIdFromModelOptions.mockReturnValue([classicModelOptions]);
    dependencies.usePointCloudDMVolumes.mockReturnValue(createMockQueryResult([]));
  });

  test('returns empty array when assetInstanceRefs is empty', () => {
    const { result } = renderHook(() => usePointCloudDMVolumeMappingForAssetInstances([]), {
      wrapper
    });

    expect(result.current).toEqual([]);
  });

  test('returns empty array when classicAddModelOptions is empty', () => {
    dependencies.useModelIdRevisionIdFromModelOptions.mockReturnValue([]);

    const { result } = renderHook(
      () => usePointCloudDMVolumeMappingForAssetInstances([assetInstance1]),
      { wrapper }
    );

    expect(result.current).toEqual([]);
  });

  test('returns empty array when pointCloudVolumeResults is undefined', () => {
    dependencies.usePointCloudDMVolumes.mockReturnValue(createMockQueryResultNoData());

    const { result } = renderHook(
      () => usePointCloudDMVolumeMappingForAssetInstances([assetInstance1]),
      { wrapper }
    );

    expect(result.current).toEqual([]);
  });

  test('returns mapped data for single matching asset instance', () => {
    const volumeResults: DMVolumeModelDataResult[] = [
      {
        model: { ...classicModelOptions, type: 'pointcloud' },
        pointCloudDMVolumeWithAsset: [volumeWithAsset1]
      }
    ];

    dependencies.usePointCloudDMVolumes.mockReturnValue(createMockQueryResult(volumeResults));

    const { result } = renderHook(
      () => usePointCloudDMVolumeMappingForAssetInstances([assetInstance1]),
      { wrapper }
    );

    expect(result.current).toEqual([
      {
        volumeInstanceRef: {
          externalId: 'test-volume-external-id-1',
          space: 'test-space'
        },
        asset: volumeWithAsset1.dmAsset
      }
    ]);
  });

  test('returns mapped data for multiple matching asset instances', () => {
    const volumeResults: DMVolumeModelDataResult[] = [
      {
        model: { ...classicModelOptions, type: 'pointcloud' },
        pointCloudDMVolumeWithAsset: [volumeWithAsset1, volumeWithAsset2]
      }
    ];

    dependencies.usePointCloudDMVolumes.mockReturnValue(createMockQueryResult(volumeResults));

    const { result } = renderHook(
      () => usePointCloudDMVolumeMappingForAssetInstances([assetInstance1, assetInstance2]),
      { wrapper }
    );

    expect(result.current).toEqual([
      {
        volumeInstanceRef: {
          externalId: 'test-volume-external-id-1',
          space: 'test-space'
        },
        asset: volumeWithAsset1.dmAsset
      },
      {
        volumeInstanceRef: {
          externalId: 'test-volume-external-id-2',
          space: 'test-space'
        },
        asset: volumeWithAsset2.dmAsset
      }
    ]);
  });

  test('filters out volumes without dmAsset', () => {
    const volumeResults: DMVolumeModelDataResult[] = [
      {
        model: { ...classicModelOptions, type: 'pointcloud' },
        pointCloudDMVolumeWithAsset: [volumeWithAsset1, volumeWithoutAsset]
      }
    ];

    dependencies.usePointCloudDMVolumes.mockReturnValue(createMockQueryResult(volumeResults));

    const { result } = renderHook(
      () => usePointCloudDMVolumeMappingForAssetInstances([assetInstance1]),
      { wrapper }
    );

    expect(result.current).toEqual([
      {
        volumeInstanceRef: {
          externalId: 'test-volume-external-id-1',
          space: 'test-space'
        },
        asset: volumeWithAsset1.dmAsset
      }
    ]);
  });

  test('filters out non-matching asset instances', () => {
    const nonMatchingAsset: DmsUniqueIdentifier = {
      externalId: 'non-existing-asset',
      space: 'test-space'
    };

    const volumeResults: DMVolumeModelDataResult[] = [
      {
        model: { ...classicModelOptions, type: 'pointcloud' },
        pointCloudDMVolumeWithAsset: [volumeWithAsset1]
      }
    ];

    dependencies.usePointCloudDMVolumes.mockReturnValue(createMockQueryResult(volumeResults));

    const { result } = renderHook(
      () => usePointCloudDMVolumeMappingForAssetInstances([nonMatchingAsset]),
      { wrapper }
    );

    expect(result.current).toEqual([]);
  });

  test('handles multiple models with volumes', () => {
    const volumeResults: DMVolumeModelDataResult[] = [
      {
        model: { ...classicModelOptions, type: 'pointcloud' },
        pointCloudDMVolumeWithAsset: [volumeWithAsset1]
      },
      {
        model: { ...classicModelOptions2, type: 'pointcloud' },
        pointCloudDMVolumeWithAsset: [volumeWithAsset2]
      }
    ];

    dependencies.useModelIdRevisionIdFromModelOptions.mockReturnValue([
      classicModelOptions,
      classicModelOptions2
    ]);
    dependencies.usePointCloudDMVolumes.mockReturnValue(createMockQueryResult(volumeResults));

    const { result } = renderHook(
      () => usePointCloudDMVolumeMappingForAssetInstances([assetInstance1, assetInstance2]),
      { wrapper }
    );

    expect(result.current).toEqual([
      {
        volumeInstanceRef: {
          externalId: 'test-volume-external-id-1',
          space: 'test-space'
        },
        asset: volumeWithAsset1.dmAsset
      },
      {
        volumeInstanceRef: {
          externalId: 'test-volume-external-id-2',
          space: 'test-space'
        },
        asset: volumeWithAsset2.dmAsset
      }
    ]);
  });

  test('matches by both externalId and space', () => {
    const assetDifferentSpace: DmsUniqueIdentifier = {
      externalId: 'test-external-id-1',
      space: 'different-space'
    };

    const volumeResults: DMVolumeModelDataResult[] = [
      {
        model: { ...classicModelOptions, type: 'pointcloud' },
        pointCloudDMVolumeWithAsset: [volumeWithAsset1]
      }
    ];

    dependencies.usePointCloudDMVolumes.mockReturnValue(createMockQueryResult(volumeResults));

    const { result } = renderHook(
      () => usePointCloudDMVolumeMappingForAssetInstances([assetDifferentSpace]),
      { wrapper }
    );

    // Should not match because space is different
    expect(result.current).toEqual([]);
  });

  test('should call usePointCloudModelRevisionIdsFromReveal', () => {
    renderHook(() => usePointCloudDMVolumeMappingForAssetInstances([assetInstance1]), {
      wrapper
    });

    expect(dependencies.usePointCloudModelRevisionIdsFromReveal).toHaveBeenCalled();
  });

  test('should call useModelIdRevisionIdFromModelOptions with correct models', () => {
    const mockModels = [classicModelOptions];
    dependencies.usePointCloudModelRevisionIdsFromReveal.mockReturnValue(
      createMockQueryResult(mockModels)
    );

    renderHook(() => usePointCloudDMVolumeMappingForAssetInstances([assetInstance1]), {
      wrapper
    });

    expect(dependencies.useModelIdRevisionIdFromModelOptions).toHaveBeenCalledWith(mockModels);
  });

  test('should call usePointCloudDMVolumes with correct model options', () => {
    renderHook(() => usePointCloudDMVolumeMappingForAssetInstances([assetInstance1]), {
      wrapper
    });

    expect(dependencies.usePointCloudDMVolumes).toHaveBeenCalledWith([classicModelOptions]);
  });

  test('returns consistent results with same inputs', () => {
    const volumeResults: DMVolumeModelDataResult[] = [
      {
        model: { ...classicModelOptions, type: 'pointcloud' },
        pointCloudDMVolumeWithAsset: [volumeWithAsset1]
      }
    ];

    dependencies.usePointCloudDMVolumes.mockReturnValue(createMockQueryResult(volumeResults));

    const { result } = renderHook(
      () => usePointCloudDMVolumeMappingForAssetInstances([assetInstance1]),
      { wrapper }
    );

    expect(result.current).toEqual([
      {
        volumeInstanceRef: {
          externalId: 'test-volume-external-id-1',
          space: 'test-space'
        },
        asset: volumeWithAsset1.dmAsset
      }
    ]);
  });
});

describe(usePointCloudFdmVolumeMappingForIntersection.name, () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  const dependencies = getMocksByDefaultDependencies(
    defaultUsePointCloudDMVolumeMappingForAssetInstancesDependencies
  );

  const mockViews: Source[] = [
    {
      externalId: 'test-view-external-id-1',
      space: 'test-space',
      version: 'v1',
      type: 'view'
    }
  ];

  const mockInspectInstances = vi.fn<FdmSDK['inspectInstances']>();
  const mockFdmSdk = new Mock<FdmSDK>()
    .setup((instance) => instance.inspectInstances)
    .returns(mockInspectInstances)
    .object();

  const mockUseFdmSdk =
    vi.fn<UsePointCloudDMVolumeMappingForAssetInstancesDependencies['useFdmSdk']>();

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <QueryClientProvider client={queryClient}>
      <UsePointCloudDMVolumeMappingForAssetInstancesContext.Provider value={dependencies}>
        {children}
      </UsePointCloudDMVolumeMappingForAssetInstancesContext.Provider>
    </QueryClientProvider>
  );

  const testPointCloudModelRevisionIdAndType: PointCloudModelRevisionIdAndType = {
    modelId: 123,
    revisionId: 456,
    type: 'pointcloud'
  };

  const assetRef: DmsUniqueIdentifier = {
    externalId: 'test-external-id-1',
    space: 'test-space'
  };

  const mockPointCloudModel: CognitePointCloudModel<DMDataSourceType> = createPointCloudDMMock();

  const mockPointCloudIntersection = createMockPointCloudIntersection();

  beforeEach(() => {
    queryClient.clear();

    mockInspectInstances.mockResolvedValue({
      items: [
        {
          instanceType: 'node',
          externalId: 'test-external-id-1',
          space: 'test-space',
          inspectionResults: {
            involvedContainers: [],
            involvedViews: mockViews
          }
        }
      ]
    });

    mockUseFdmSdk.mockReturnValue(mockFdmSdk);
    dependencies.useFdmSdk = mockUseFdmSdk;
    dependencies.usePointCloudModelRevisionIdsFromReveal.mockReturnValue(
      createMockQueryResult([testPointCloudModelRevisionIdAndType])
    );
    dependencies.useModelIdRevisionIdFromModelOptions.mockReturnValue([
      testPointCloudModelRevisionIdAndType
    ]);
    dependencies.usePointCloudDMVolumes.mockReturnValue(createMockQueryResultNoData());
  });

  test('returns undefined when intersection is undefined', async () => {
    const { result } = renderHook(() => usePointCloudFdmVolumeMappingForIntersection(undefined), {
      wrapper
    });

    expect(result.current.data).toBeUndefined();
  });

  test('returns undefined when intersection is not pointcloud type', async () => {
    const cadIntersection: AnyIntersection = {
      type: 'cad',
      model: createCadMock(),
      point: new Vector3(0, 0, 0),
      treeIndex: 0,
      distanceToCamera: 0
    };

    const { result } = renderHook(
      () => usePointCloudFdmVolumeMappingForIntersection(cadIntersection),
      { wrapper }
    );

    expect(result.current.data).toBeUndefined();
  });

  test('returns undefined when intersection has no volumeMetadata', async () => {
    const intersectionNoVolume = createMockPointCloudIntersection(false, false);

    const { result } = renderHook(
      () => usePointCloudFdmVolumeMappingForIntersection(intersectionNoVolume),
      { wrapper }
    );

    expect(result.current.data).toBeUndefined();
  });

  test('returns undefined when volumeMetadata has no assetRef', async () => {
    const intersectionNoAssetRef = createMockPointCloudIntersection(true, false);

    const { result } = renderHook(
      () => usePointCloudFdmVolumeMappingForIntersection(intersectionNoAssetRef),
      { wrapper }
    );

    expect(result.current.data).toBeUndefined();
  });

  test('returns undefined when no volume mappings available', async () => {
    const { result } = renderHook(
      () => usePointCloudFdmVolumeMappingForIntersection(mockPointCloudIntersection),
      { wrapper }
    );

    expect(result.current.isFetching).toBe(false);
  });

  test('returns volume mappings with views when valid intersection provided', async () => {
    const volumeWithAsset: PointCloudVolumeWithAsset = createPointCloudVolumeWithAsset({
      externalId: 'volume-1',
      space: 'test-space',
      dmAsset: {
        externalId: 'test-external-id-1',
        space: 'test-space',
        name: 'Asset 1',
        description: '',
        object3D: {
          externalId: 'test-object-external-id-1',
          space: 'test-space'
        }
      }
    });

    const volumeResults: DMVolumeModelDataResult[] = [
      {
        model: testPointCloudModelRevisionIdAndType,
        pointCloudDMVolumeWithAsset: [volumeWithAsset]
      }
    ];

    dependencies.usePointCloudDMVolumes.mockReturnValue(createMockQueryResult(volumeResults));

    const { result } = renderHook(
      () => usePointCloudFdmVolumeMappingForIntersection(mockPointCloudIntersection),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([
      {
        views: mockViews,
        assetInstance: volumeWithAsset.dmAsset
      }
    ]);
  });

  test('calls inspectInstances for each volume mapping', async () => {
    const volumeWithAsset: PointCloudVolumeWithAsset = createPointCloudVolumeWithAsset({
      externalId: 'volume-1',
      space: 'test-space',
      dmAsset: {
        externalId: 'test-external-id-1',
        space: 'test-space',
        name: 'Asset 1',
        description: '',
        object3D: {
          externalId: 'test-object-external-id-1',
          space: 'test-space'
        }
      }
    });

    const volumeResults: DMVolumeModelDataResult[] = [
      {
        model: testPointCloudModelRevisionIdAndType,
        pointCloudDMVolumeWithAsset: [volumeWithAsset]
      }
    ];

    dependencies.usePointCloudDMVolumes.mockReturnValue(createMockQueryResult(volumeResults));

    const { result } = renderHook(
      () => usePointCloudFdmVolumeMappingForIntersection(mockPointCloudIntersection),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockInspectInstances).toHaveBeenCalledTimes(1);
    expect(mockInspectInstances).toHaveBeenCalledWith({
      inspectionOperations: { involvedViews: { allVersions: true } },
      items: [
        {
          instanceType: 'node',
          externalId: 'test-external-id-1',
          space: 'test-space'
        }
      ]
    });
  });

  test('handles multiple views in inspection results', async () => {
    const multipleViews: Source[] = [
      {
        externalId: 'test-view-external-id-1',
        space: 'test-space',
        version: 'v1',
        type: 'view'
      },
      {
        externalId: 'test-view-external-id-2',
        space: 'test-space',
        version: 'v1',
        type: 'view'
      }
    ];

    mockInspectInstances.mockResolvedValue({
      items: [
        {
          instanceType: 'node',
          externalId: 'test-external-id-1',
          space: 'test-space',
          inspectionResults: {
            involvedContainers: [],
            involvedViews: multipleViews
          }
        }
      ]
    });

    const volumeWithAsset: PointCloudVolumeWithAsset = createPointCloudVolumeWithAsset({
      externalId: 'volume-1',
      space: 'test-space',
      dmAsset: {
        externalId: 'test-external-id-1',
        space: 'test-space',
        name: 'Asset 1',
        description: '',
        object3D: {
          externalId: 'test-object-external-id-1',
          space: 'test-space'
        }
      }
    });

    const volumeResults: DMVolumeModelDataResult[] = [
      {
        model: testPointCloudModelRevisionIdAndType,
        pointCloudDMVolumeWithAsset: [volumeWithAsset]
      }
    ];

    dependencies.usePointCloudDMVolumes.mockReturnValue(createMockQueryResult(volumeResults));

    const { result } = renderHook(
      () => usePointCloudFdmVolumeMappingForIntersection(mockPointCloudIntersection),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([
      {
        views: multipleViews,
        assetInstance: volumeWithAsset.dmAsset
      }
    ]);
  });

  test('calls useFdmSdk hook and uses FdmSDK', async () => {
    const volumeWithAsset: PointCloudVolumeWithAsset = createPointCloudVolumeWithAsset({
      externalId: 'volume-1',
      space: 'test-space',
      dmAsset: {
        externalId: 'test-external-id-1',
        space: 'test-space',
        name: 'Asset 1',
        description: '',
        object3D: {
          externalId: 'test-object-external-id-1',
          space: 'test-space'
        }
      }
    });

    const volumeResults: DMVolumeModelDataResult[] = [
      {
        model: testPointCloudModelRevisionIdAndType,
        pointCloudDMVolumeWithAsset: [volumeWithAsset]
      }
    ];

    dependencies.usePointCloudDMVolumes.mockReturnValue(createMockQueryResult(volumeResults));

    renderHook(() => usePointCloudFdmVolumeMappingForIntersection(mockPointCloudIntersection), {
      wrapper
    });

    await waitFor(() => {
      expect(mockUseFdmSdk).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockInspectInstances).toHaveBeenCalled();
    });
  });

  test('handles empty volume mappings after usePointCloudDMVolumeMappingForAssetInstances returns empty array', async () => {
    dependencies.usePointCloudDMVolumes.mockReturnValue(createMockQueryResult([]));

    const { result } = renderHook(
      () => usePointCloudFdmVolumeMappingForIntersection(mockPointCloudIntersection),
      { wrapper }
    );

    expect(result.current.isFetching).toBe(false);
    expect(mockInspectInstances).not.toHaveBeenCalled();
  });

  function createMockPointCloudIntersection(
    hasVolumeMetadata = true,
    hasAssetRef = true
  ): PointCloudIntersection<DMDataSourceType> {
    return new Mock<PointCloudIntersection<DMDataSourceType>>()
      .setup((p) => p.type)
      .returns('pointcloud')
      .setup((p) => p.model)
      .returns(mockPointCloudModel)
      .setup((p) => p.point)
      .returns(new Vector3(1, 2, 3))
      .setup((p) => p.pointIndex)
      .returns(0)
      .setup((p) => p.distanceToCamera)
      .returns(5)
      .setup((p) => p.volumeMetadata)
      .returns(
        hasVolumeMetadata
          ? {
              volumeInstanceRef: {
                externalId: 'volume-1',
                space: 'test-space'
              },
              assetRef: hasAssetRef ? assetRef : undefined
            }
          : undefined
      )
      .object();
  }
});

function createPointCloudVolumeWithAsset(
  overrides?: Partial<PointCloudVolumeWithAsset>
): PointCloudVolumeWithAsset {
  return new Mock<PointCloudVolumeWithAsset>()
    .setup((p) => p.externalId)
    .returns(overrides?.externalId ?? 'test-volume-external-id-1')
    .setup((p) => p.space)
    .returns(overrides?.space ?? 'test-space')
    .setup((p) => p.dmAsset)
    .returns(overrides?.dmAsset)
    .object();
}

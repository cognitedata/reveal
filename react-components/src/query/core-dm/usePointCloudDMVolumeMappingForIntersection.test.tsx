import { createCadMock } from '#test-utils/fixtures/cadModel';
import { createPointCloudDMMock } from '#test-utils/fixtures/pointCloud';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import {
  type CognitePointCloudModel,
  type DMDataSourceType,
  type AnyIntersection,
  type PointCloudIntersection
} from '@cognite/reveal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { Mock } from 'moq.ts';
import { type ReactNode, type ReactElement } from 'react';
import { Vector3 } from 'three';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { type DmsUniqueIdentifier, type Source } from '../../data-providers';
import { type FdmSDK } from '../../data-providers/FdmSDK';
import {
  type UsePointCloudDMVolumeMappingForIntersectionDependencies,
  defaultUsePointCloudDMVolumeMappingForIntersectionDependencies,
  UsePointCloudDMVolumeMappingForIntersectionContext
} from './usePointCloudDMVolumeMappingForIntersection.context';
import { usePointCloudDMVolumeMappingForIntersection } from './usePointCloudDMVolumeMappingForIntersection';
import { type PointCloudDMVolumeMappedAssetData } from './usePointCloudDMVolumeMappingForAssetInstances';

describe(usePointCloudDMVolumeMappingForIntersection.name, () => {
  const TEST_EXTERNAL_ID = 'test-external-id-1';
  const TEST_SPACE = 'test-space';
  const TEST_VOLUME_EXTERNAL_ID = 'test-volume-external-id-1';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  const dependencies = getMocksByDefaultDependencies(
    defaultUsePointCloudDMVolumeMappingForIntersectionDependencies
  );

  const mockViews: Source[] = [
    {
      externalId: 'test-view-external-id-1',
      space: TEST_SPACE,
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
    vi.fn<UsePointCloudDMVolumeMappingForIntersectionDependencies['useFdmSdk']>();

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <QueryClientProvider client={queryClient}>
      <UsePointCloudDMVolumeMappingForIntersectionContext.Provider value={dependencies}>
        {children}
      </UsePointCloudDMVolumeMappingForIntersectionContext.Provider>
    </QueryClientProvider>
  );

  const assetRef: DmsUniqueIdentifier = {
    externalId: TEST_EXTERNAL_ID,
    space: TEST_SPACE
  };

  const mockPointCloudModel: CognitePointCloudModel<DMDataSourceType> = createPointCloudDMMock();

  const mockPointCloudIntersection = createMockPointCloudIntersection();

  beforeEach(() => {
    queryClient.clear();

    mockInspectInstances.mockResolvedValue({
      items: [
        {
          instanceType: 'node',
          externalId: TEST_EXTERNAL_ID,
          space: TEST_SPACE,
          inspectionResults: {
            involvedContainers: [],
            involvedViews: mockViews
          }
        }
      ]
    });

    mockUseFdmSdk.mockReturnValue(mockFdmSdk);
    dependencies.useFdmSdk = mockUseFdmSdk;
  });

  test('returns undefined when intersection is undefined', async () => {
    const { result } = renderHook(() => usePointCloudDMVolumeMappingForIntersection(undefined), {
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
      () => usePointCloudDMVolumeMappingForIntersection(cadIntersection),
      { wrapper }
    );

    expect(result.current.data).toBeUndefined();
  });

  test('returns undefined when intersection has no volumeMetadata', async () => {
    const intersectionNoVolume = createMockPointCloudIntersection(false, false);

    const { result } = renderHook(
      () => usePointCloudDMVolumeMappingForIntersection(intersectionNoVolume),
      { wrapper }
    );

    expect(result.current.data).toBeUndefined();
  });

  test('returns undefined when volumeMetadata has no assetRef', async () => {
    const intersectionNoAssetRef = createMockPointCloudIntersection(true, false);

    const { result } = renderHook(
      () => usePointCloudDMVolumeMappingForIntersection(intersectionNoAssetRef),
      { wrapper }
    );

    expect(result.current.data).toBeUndefined();
  });

  test('returns undefined when no volume mappings available', async () => {
    const { result } = renderHook(
      () => usePointCloudDMVolumeMappingForIntersection(mockPointCloudIntersection),
      { wrapper }
    );

    expect(result.current.isFetching).toBe(false);
  });

  test('returns volume mappings with views when valid intersection provided', async () => {
    const volumeResults = [createPointCloudDMVolumeMappedAssetData()];

    dependencies.usePointCloudDMVolumeMappingForAssetInstances.mockReturnValue(volumeResults);

    const { result } = renderHook(
      () => usePointCloudDMVolumeMappingForIntersection(mockPointCloudIntersection),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const expectedAsset = volumeResults[0].asset;
    expect(result.current.data).toEqual([
      {
        views: mockViews,
        assetInstance: expectedAsset
      }
    ]);
  });

  test('calls inspectInstances for each volume mapping', async () => {
    const volumeResults = [createPointCloudDMVolumeMappedAssetData()];

    dependencies.usePointCloudDMVolumeMappingForAssetInstances.mockReturnValue(volumeResults);

    const { result } = renderHook(
      () => usePointCloudDMVolumeMappingForIntersection(mockPointCloudIntersection),
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
          externalId: TEST_EXTERNAL_ID,
          space: TEST_SPACE
        }
      ]
    });
  });

  test('handles multiple views in inspection results', async () => {
    const multipleViews: Source[] = [
      {
        externalId: 'test-view-external-id-1',
        space: TEST_SPACE,
        version: 'v1',
        type: 'view'
      },
      {
        externalId: 'test-view-external-id-2',
        space: TEST_SPACE,
        version: 'v1',
        type: 'view'
      }
    ];

    mockInspectInstances.mockResolvedValue({
      items: [
        {
          instanceType: 'node',
          externalId: TEST_EXTERNAL_ID,
          space: TEST_SPACE,
          inspectionResults: {
            involvedContainers: [],
            involvedViews: multipleViews
          }
        }
      ]
    });

    const volumeResults = [createPointCloudDMVolumeMappedAssetData()];

    dependencies.usePointCloudDMVolumeMappingForAssetInstances.mockReturnValue(volumeResults);

    const { result } = renderHook(
      () => usePointCloudDMVolumeMappingForIntersection(mockPointCloudIntersection),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const expectedAsset = volumeResults[0].asset;
    expect(result.current.data).toEqual([
      {
        views: multipleViews,
        assetInstance: expectedAsset
      }
    ]);
  });

  test('calls useFdmSdk hook and uses FdmSDK', async () => {
    const volumeResults = [createPointCloudDMVolumeMappedAssetData()];

    dependencies.usePointCloudDMVolumeMappingForAssetInstances.mockReturnValue(volumeResults);

    renderHook(() => usePointCloudDMVolumeMappingForIntersection(mockPointCloudIntersection), {
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
    dependencies.usePointCloudDMVolumeMappingForAssetInstances.mockReturnValue([]);

    const { result } = renderHook(
      () => usePointCloudDMVolumeMappingForIntersection(mockPointCloudIntersection),
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
                externalId: TEST_VOLUME_EXTERNAL_ID,
                space: TEST_SPACE
              },
              assetRef: hasAssetRef ? assetRef : undefined
            }
          : undefined
      )
      .object();
  }

  function createPointCloudDMVolumeMappedAssetData(
    overrides?: Partial<PointCloudDMVolumeMappedAssetData>
  ): PointCloudDMVolumeMappedAssetData {
    return {
      volumeInstanceRef: overrides?.volumeInstanceRef ?? {
        externalId: TEST_VOLUME_EXTERNAL_ID,
        space: TEST_SPACE
      },
      asset: overrides?.asset ?? {
        externalId: TEST_EXTERNAL_ID,
        space: TEST_SPACE,
        name: 'Asset 1',
        description: '',
        object3D: {
          externalId: 'test-object-external-id-1',
          space: TEST_SPACE
        }
      }
    };
  }
});

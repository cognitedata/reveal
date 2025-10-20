import { describe, expect, beforeEach, test } from 'vitest';
import { renderHook } from '@testing-library/react';
import { type ReactElement, type ReactNode } from 'react';
import { usePointCloudDMVolumeMappingForAssetInstances } from './usePointCloudDMVolumeMappingForAssetInstances';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import {
  defaultUsePointCloudDMVolumeMappingForAssetInstancesDependencies,
  UsePointCloudDMVolumeMappingForAssetInstancesContext
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

describe(usePointCloudDMVolumeMappingForAssetInstances.name, () => {
  const TEST_EXTERNAL_ID = 'test-external-id-1';
  const TEST_SPACE = 'test-space';
  const TEST_VOLUME_EXTERNAL_ID = 'test-volume-external-id-1';
  const TEST_VOLUME_EXTERNAL_ID_2 = 'test-volume-external-id-2';

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
    externalId: TEST_EXTERNAL_ID,
    space: TEST_SPACE
  };

  const assetInstance2: DmsUniqueIdentifier = {
    externalId: 'test-external-id-2',
    space: TEST_SPACE
  };

  const volumeWithAsset1 = createPointCloudVolumeWithAsset({
    externalId: TEST_VOLUME_EXTERNAL_ID,
    space: TEST_SPACE,
    dmAsset: {
      externalId: TEST_EXTERNAL_ID,
      space: TEST_SPACE,
      name: 'Asset 1',
      description: '',
      object3D: {
        externalId: 'test-object-external-id-1',
        space: TEST_SPACE
      }
    }
  });

  const volumeWithAsset2 = createPointCloudVolumeWithAsset({
    externalId: TEST_VOLUME_EXTERNAL_ID_2,
    space: TEST_SPACE,
    dmAsset: {
      externalId: 'test-external-id-2',
      space: TEST_SPACE,
      name: 'Asset 2',
      description: '',
      object3D: {
        externalId: 'test-object-external-id-2',
        space: TEST_SPACE
      }
    }
  });

  const volumeWithoutAsset = createPointCloudVolumeWithAsset({
    externalId: 'test-volume-external-id-3',
    space: TEST_SPACE,
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
          externalId: TEST_VOLUME_EXTERNAL_ID,
          space: TEST_SPACE
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
          externalId: TEST_VOLUME_EXTERNAL_ID,
          space: TEST_SPACE
        },
        asset: volumeWithAsset1.dmAsset
      },
      {
        volumeInstanceRef: {
          externalId: TEST_VOLUME_EXTERNAL_ID_2,
          space: TEST_SPACE
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
          externalId: TEST_VOLUME_EXTERNAL_ID,
          space: TEST_SPACE
        },
        asset: volumeWithAsset1.dmAsset
      }
    ]);
  });

  test('filters out non-matching asset instances', () => {
    const nonMatchingAsset: DmsUniqueIdentifier = {
      externalId: 'non-existing-asset',
      space: TEST_SPACE
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
          externalId: TEST_VOLUME_EXTERNAL_ID,
          space: TEST_SPACE
        },
        asset: volumeWithAsset1.dmAsset
      },
      {
        volumeInstanceRef: {
          externalId: TEST_VOLUME_EXTERNAL_ID_2,
          space: TEST_SPACE
        },
        asset: volumeWithAsset2.dmAsset
      }
    ]);
  });

  test('matches by both externalId and space', () => {
    const assetDifferentSpace: DmsUniqueIdentifier = {
      externalId: TEST_EXTERNAL_ID,
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
          externalId: TEST_VOLUME_EXTERNAL_ID,
          space: TEST_SPACE
        },
        asset: volumeWithAsset1.dmAsset
      }
    ]);
  });

  function createPointCloudVolumeWithAsset(
    overrides?: Partial<PointCloudVolumeWithAsset>
  ): PointCloudVolumeWithAsset {
    return new Mock<PointCloudVolumeWithAsset>()
      .setup((p) => p.externalId)
      .returns(overrides?.externalId ?? TEST_VOLUME_EXTERNAL_ID)
      .setup((p) => p.space)
      .returns(overrides?.space ?? TEST_SPACE)
      .setup((p) => p.dmAsset)
      .returns(overrides?.dmAsset)
      .object();
  }
});

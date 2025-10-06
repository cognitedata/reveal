import { describe, expect, beforeEach, test, vi } from 'vitest';
import { type RevealRenderTarget } from '../architecture';
import { type InstanceReference } from './instanceIds';
import {
  type CadIntersection,
  type PointCloudIntersection,
  type AnyIntersection,
  Image360AnnotationIntersection,
  DataSourceType,
  Image360Annotation
} from '@cognite/reveal';
import { Vector2, Vector3 } from 'three';
import { Mock } from 'moq.ts';
import { type CdfCaches } from '../architecture/base/renderTarget/CdfCaches';
import { cadMock } from '#test-utils/fixtures/cadModel';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { viewerMock } from '#test-utils/fixtures/viewer';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { getInstancesFromClick } from './getInstancesFromClick';
import { getInstanceReferenceFromImage360Annotation } from '../components/CacheProvider/utils';
import { DmsUniqueIdentifier } from '../data-providers';
import { IdEither } from '@cognite/sdk';
import { fetchAncestorNodesForTreeIndex } from '../components/CacheProvider/requests';
import { createCadNodeMock } from '#test-utils/fixtures/cadNode';
import { HybridCadNodeAssetMappingResult } from '../components/CacheProvider/cad/ClassicCadAssetMappingCache';
import { createAssetMappingMock } from '#test-utils/fixtures/cadAssetMapping';
import { fetchAnnotationsForModel } from '../hooks/pointClouds/fetchAnnotationsForModel';
import { PointCloudAnnotationMappedAssetData } from '../hooks';
import { createAssetMock } from '#test-utils/fixtures/assets';

vi.mock(import('../components/CacheProvider/requests'), () => ({
  fetchAncestorNodesForTreeIndex: vi.fn<typeof fetchAncestorNodesForTreeIndex>()
}));

vi.mock(import('../hooks/pointClouds/fetchAnnotationsForModel'), () => ({
  fetchAnnotationsForModel: vi.fn<typeof fetchAnnotationsForModel>()
}));

vi.mock(import('../components/CacheProvider/utils'), () => ({
  getInstanceReferenceFromImage360Annotation:
    vi.fn<typeof getInstanceReferenceFromImage360Annotation>()
}));

describe(getInstancesFromClick.name, () => {
  let mockRenderTarget: RevealRenderTarget;
  let mockEvent: PointerEvent;

  const classicIdEither: IdEither = { id: 123 };
  const dmInstanceRef: DmsUniqueIdentifier = {
    externalId: 'test-external-id',
    space: 'test-space'
  };
  const node3d = createCadNodeMock({
    id: 101,
    treeIndex: 1,
    subtreeSize: 1
  });
  const hybridAssetMappings: HybridCadNodeAssetMappingResult = {
    node: node3d,
    mappings: [createAssetMappingMock({ assetId: classicIdEither.id })]
  };
  const classicAssetInstance = createAssetMock(123);
  const classicAssetInstance2 = createAssetMock(456);

  const mockFetchAnnotationsForModelReturn: PointCloudAnnotationMappedAssetData[] = [
    { annotationId: 1, asset: classicAssetInstance },
    { annotationId: 2, asset: classicAssetInstance2 },
  ];

  const mockCadIntersection: CadIntersection = {
    type: 'cad',
    model: cadMock,
    point: new Vector3(1, 2, 3),
    treeIndex: 123,
    distanceToCamera: 10
  };

  const mockPointCloudIntersection: PointCloudIntersection = {
    type: 'pointcloud',
    model: createPointCloudMock(),
    point: new Vector3(4, 5, 6),
    pointIndex: 456,
    distanceToCamera: 15,
    annotationId: 789,
    volumeMetadata: {
      assetRef: classicIdEither,
      instanceRef: dmInstanceRef,
      annotationId: 0
    }
  };

  const mockPointCloudIntersectionInstanceRef: PointCloudIntersection = {
    type: 'pointcloud',
    model: createPointCloudMock(),
    point: new Vector3(4, 5, 6),
    pointIndex: 456,
    distanceToCamera: 15,
    annotationId: 789,
    volumeMetadata: {
      assetRef: undefined,
      instanceRef: dmInstanceRef,
      annotationId: 0
    }
  };

  const mockImage360Intersection: Image360AnnotationIntersection<DataSourceType> = {
    annotation: {
      annotation: {
        id: 123,
        createdTime: new Date(),
        lastUpdatedTime: new Date(),
        annotatedResourceId: 1,
        annotationType: 'image360',
        status: 'approved',
        annotatedResourceType: 'threedmodel',
        creatingApp: 'test-app',
        creatingAppVersion: '1.0.0',
        creatingUser: 'test-user',
        data: {}
      }
    } as Image360Annotation<DataSourceType>,
    type: 'image360Annotation',
    direction: new Vector3()
  };

  const mockClassicCadAssetMappingCache = new Mock<CdfCaches['classicCadAssetMappingCache']>()
    .setup((p) => p.getAssetMappingsForLowestAncestor)
    .returns(async () => hybridAssetMappings)
    .object();

  const mockCaches = new Mock<CdfCaches>()
    .setup((p) => p.coreDmOnly)
    .returns(false)
    .setup((p) => p.cogniteClient)
    .returns(sdkMock)
    .setup((p) => p.classicCadAssetMappingCache)
    .returns(mockClassicCadAssetMappingCache)
    .object();

  viewerMock.getPixelCoordinatesFromEvent = vi
    .fn<typeof viewerMock.getPixelCoordinatesFromEvent>()
    .mockReturnValue(new Vector2(100, 200));

  mockRenderTarget = new Mock<RevealRenderTarget>()
    .setup((p) => p.viewer)
    .returns(viewerMock)
    .setup((p) => p.cdfCaches)
    .returns(mockCaches)
    .object();

  beforeEach(() => {
    vi.clearAllMocks();

    mockEvent = {
      offsetX: 100,
      offsetY: 200
    } as PointerEvent;

    vi.mocked(viewerMock.get360AnnotationIntersectionFromPixel).mockResolvedValue(
      mockImage360Intersection
    );
  });

  test('returns undefined when no intersection is found', async () => {
    const result = await getInstancesFromClick(mockRenderTarget, mockEvent);

    expect(result).toBeUndefined();
  });

  test('returns image360 annotation asset when found and coreDmOnly is false', async () => {
    vi.mocked(getInstanceReferenceFromImage360Annotation).mockReturnValue(classicIdEither);
    const result = await getInstancesFromClick(mockRenderTarget, mockEvent);

    expect(result).toEqual([classicIdEither]);
  });

  test('does not return image360 annotation when coreDmOnly is true', async () => {
    const result = await getInstancesFromClick(mockRenderTarget, mockEvent);

    expect(result).not.toEqual(classicIdEither);
  });

  test('calls getInstancesFromCadIntersection for CAD intersection', async () => {
    vi.mocked(fetchAncestorNodesForTreeIndex).mockResolvedValue([node3d]);
    vi.mocked(viewerMock.getAnyIntersectionFromPixel).mockResolvedValue(mockCadIntersection);

    const result = await getInstancesFromClick(mockRenderTarget, mockEvent);

    expect(result).toEqual([classicIdEither]);
  });

  test('calls getInstancesFromPointCloudIntersection for pointcloud intersection', async () => {
    vi.mocked(fetchAnnotationsForModel).mockResolvedValue(mockFetchAnnotationsForModelReturn);

    vi.mocked(viewerMock.getAnyIntersectionFromPixel).mockResolvedValue(mockPointCloudIntersection);

    const result = await getInstancesFromClick(mockRenderTarget, mockEvent);

    expect(result).toEqual([classicIdEither]);
  });

  test('calls getInstancesFromPointCloudIntersection for pointcloud intersection for instanceRef', async () => {
    vi.mocked(fetchAnnotationsForModel).mockResolvedValue(mockFetchAnnotationsForModelReturn);

    vi.mocked(viewerMock.getAnyIntersectionFromPixel).mockResolvedValue(
      mockPointCloudIntersectionInstanceRef
    );

    const result = await getInstancesFromClick(mockRenderTarget, mockEvent);

    expect(result).toEqual([dmInstanceRef]);
  });

  test('returns undefined for unknown intersection type', async () => {
    const unknownIntersection = {
      type: 'unknown' as any,
      point: new Vector3(1, 2, 3),
      distanceToCamera: 10
    } as AnyIntersection;

    vi.mocked(viewerMock.getAnyIntersectionFromPixel).mockResolvedValue(unknownIntersection);

    const result = await getInstancesFromClick(mockRenderTarget, mockEvent);

    expect(result).toBeUndefined();
  });
});

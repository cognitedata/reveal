import { describe, expect, test, vi } from 'vitest';
import { type RevealRenderTarget } from '../architecture';
import {
  type CadIntersection,
  type PointCloudIntersection,
  type AnyIntersection
} from '@cognite/reveal';
import { Vector2, Vector3 } from 'three';
import { Mock } from 'moq.ts';
import { type CdfCaches } from '../architecture/base/renderTarget/CdfCaches';
import { cadMock } from '#test-utils/fixtures/cadModel';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { viewerMock } from '#test-utils/fixtures/viewer';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { getInstancesFromClick } from './getInstancesFromClick';
import { type DmsUniqueIdentifier } from '../data-providers';
import { type IdEither } from '@cognite/sdk';
import { type fetchAncestorNodesForTreeIndex } from '../components/CacheProvider/requests';
import { createCadNodeMock } from '#test-utils/fixtures/cadNode';
import { type HybridCadNodeAssetMappingResult } from '../components/CacheProvider/cad/ClassicCadAssetMappingCache';
import { createAssetMappingMock } from '#test-utils/fixtures/cadAssetMapping';

describe(getInstancesFromClick.name, () => {
  const mockEvent = new Mock<PointerEvent>()
    .setup((p) => p.offsetX)
    .returns(100)
    .setup((p) => p.offsetY)
    .returns(200)
    .object();

  const classicIdEither: IdEither = { id: 123 };
  const dmInstanceRef: DmsUniqueIdentifier = {
    externalId: 'test-external-id',
    space: 'asset-space'
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

  const mockViewerGetAnyIntersectionFromPixel =
    vi.fn<typeof viewerMock.getAnyIntersectionFromPixel>();

  viewerMock.getAnyIntersectionFromPixel = mockViewerGetAnyIntersectionFromPixel;

  const mockRenderTarget = new Mock<RevealRenderTarget>()
    .setup((p) => p.viewer)
    .returns(viewerMock)
    .setup((p) => p.cdfCaches)
    .returns(mockCaches)
    .object();

  const mockfetchAncestorNodesTreeIndex = vi.fn<typeof fetchAncestorNodesForTreeIndex>();

  test('returns undefined when no intersection is found', async () => {
    const result = await getInstancesFromClick(mockRenderTarget, mockEvent, {
      fetchAncestorNodesTreeIndex: mockfetchAncestorNodesTreeIndex
    });

    expect(result).toBeUndefined();
  });

  test('does not return image360 annotation when coreDmOnly is true', async () => {
    const result = await getInstancesFromClick(mockRenderTarget, mockEvent);

    expect(result).not.toEqual(classicIdEither);
  });

  test('calls getInstancesFromCadIntersection for CAD intersection', async () => {
    mockViewerGetAnyIntersectionFromPixel.mockResolvedValue(mockCadIntersection);
    mockfetchAncestorNodesTreeIndex.mockResolvedValue([node3d]);
    const result = await getInstancesFromClick(mockRenderTarget, mockEvent, {
      fetchAncestorNodesTreeIndex: mockfetchAncestorNodesTreeIndex
    });

    expect(result).toEqual([classicIdEither]);
  });

  test('calls getInstancesFromPointCloudIntersection for pointcloud intersection and get both assetRef and instanceRef', async () => {
    mockViewerGetAnyIntersectionFromPixel.mockResolvedValue(mockPointCloudIntersection);
    const result = await getInstancesFromClick(mockRenderTarget, mockEvent, {
      fetchAncestorNodesTreeIndex: mockfetchAncestorNodesTreeIndex
    });

    expect(result).toEqual([dmInstanceRef, classicIdEither]);
  });

  test('calls getInstancesFromPointCloudIntersection for pointcloud intersection for instanceRef', async () => {
    mockViewerGetAnyIntersectionFromPixel.mockResolvedValue(mockPointCloudIntersectionInstanceRef);

    const result = await getInstancesFromClick(mockRenderTarget, mockEvent, {
      fetchAncestorNodesTreeIndex: mockfetchAncestorNodesTreeIndex
    });

    expect(result).toEqual([dmInstanceRef]);
  });

});

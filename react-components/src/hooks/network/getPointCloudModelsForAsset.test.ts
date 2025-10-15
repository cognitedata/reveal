import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getPointCloudModelsForAsset } from './getPointCloudModelsForAsset';
import { Mock } from 'moq.ts';
import { AnnotationsAssetRef, CursorAndAsyncIterator, Revision3D, type CogniteClient } from '@cognite/sdk';
import { DmsUniqueIdentifier } from '../../data-providers';
import { createCursorAndAsyncIteratorMock } from '#test-utils/fixtures/cursorAndIterator';

describe(getPointCloudModelsForAsset.name, () => {
  const ASSET_ID = 123;
  const DMS_ID: DmsUniqueIdentifier = { externalId: 'some-external-id', space: 'some-space' };
  const ARBITRARY_MODEL_ID = 12345678;
  const ARBITRARY_REVISION_ID = 87654321;

  const ARBITRARY_REVISION: Revision3D = {
    id: ARBITRARY_REVISION_ID,
    createdTime: new Date(),
    metadata: {},
    fileId: 0,
    published: false,
    status: 'Done',
    assetMappingCount: 0
  };

  const annotatedResourceType = 'threedmodel';

  const mockReverseLookup = vi.fn<CogniteClient['annotations']['reverseLookup']>();
  const mockRevision3D = vi.fn<CogniteClient['revisions3D']['list']>();

  const sdkMock = new Mock<CogniteClient>()
    .setup((p) => p.annotations.reverseLookup)
    .returns(mockReverseLookup)
    .setup((p) => p.revisions3D.list)
    .returns(mockRevision3D)
    .object();

  beforeEach(() => {
    mockReverseLookup.mockImplementation(
      (): CursorAndAsyncIterator<AnnotationsAssetRef> =>
        createCursorAndAsyncIteratorMock({
          items: []
        })
    );
    mockRevision3D.mockImplementation(
      (): CursorAndAsyncIterator<Revision3D> =>
        createCursorAndAsyncIteratorMock({
          items: [ARBITRARY_REVISION]
        })
    );
  });
  test('reverseLookup is called with expected input', async () => {
    mockReverseLookup.mockImplementation(
      (): CursorAndAsyncIterator<AnnotationsAssetRef> =>
        createCursorAndAsyncIteratorMock({
          items: []
        })
    );

    await getPointCloudModelsForAsset({ assetId: ASSET_ID, sdk: sdkMock });

    expect(mockReverseLookup).toHaveBeenCalledWith({
      filter: {
        annotatedResourceType,
        data: { assetRef: { id: ASSET_ID } }
      },
      limit: 1000
    });
  });

  test('retrieve is called with expected input', async () => {
    mockReverseLookup.mockImplementation(
      (): CursorAndAsyncIterator<AnnotationsAssetRef> =>
        createCursorAndAsyncIteratorMock({
          items: [
            {
              id: ARBITRARY_MODEL_ID
            }
          ]
        })
    );

    await getPointCloudModelsForAsset({ assetId: ASSET_ID, sdk: sdkMock });
    expect(mockReverseLookup).toHaveBeenCalledWith({
      filter: {
        annotatedResourceType,
        data: { assetRef: { id: ASSET_ID } }
      },
      limit: 1000
    });
  });

  test('returns an empty result from SDK', async () => {
    const result = await getPointCloudModelsForAsset({ assetId: ASSET_ID, sdk: sdkMock });

    expect(result).toEqual([]);
  });

  test('returns relevant point cloud model options when a dm instance is provided', async () => {
    mockReverseLookup.mockImplementation(
      (): CursorAndAsyncIterator<AnnotationsAssetRef> =>
        createCursorAndAsyncIteratorMock({
          items: [
            {
              id: ARBITRARY_MODEL_ID
            }
          ]
        })
    );

    const result = await getPointCloudModelsForAsset({ assetId: DMS_ID, sdk: sdkMock });

    expect(result).toEqual([
      {
        type: 'pointcloud',
        addOptions: { modelId: ARBITRARY_MODEL_ID, revisionId: ARBITRARY_REVISION_ID }
      }
    ]);
  });

  test('returns relevant point cloud model options when a classic asset id is provided', async () => {
    mockReverseLookup.mockImplementation(
      (): CursorAndAsyncIterator<AnnotationsAssetRef> =>
        createCursorAndAsyncIteratorMock({
          items: [
            {
              id: ARBITRARY_MODEL_ID
            }
          ]
        })
    );

    const result = await getPointCloudModelsForAsset({ assetId: ASSET_ID, sdk: sdkMock });

    expect(result).toEqual([
      {
        type: 'pointcloud',
        addOptions: { modelId: ARBITRARY_MODEL_ID, revisionId: ARBITRARY_REVISION_ID }
      }
    ]);
  });
});

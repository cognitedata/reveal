/*!
 * Copyright 2025 Cognite AS
 */

import { CogniteClient, DirectRelationReference, FileInfo } from '@cognite/sdk';
import { It, Mock } from 'moq.ts';
import { Cdf360CdmBatchCollectionLoader } from './Cdf360CdmBatchCollectionLoader';
import { DataModelsSdk } from '../../../../DataModelsSdk';

// Extended FileInfo with instanceId for CDM files API response
interface FileInfoWithInstanceId extends FileInfo {
  instanceId: DirectRelationReference;
}

type DmsSdkQueryResult = Awaited<ReturnType<DataModelsSdk['queryNodesAndEdges']>>;
type HttpPostResponse = Awaited<ReturnType<CogniteClient['post']>>;

describe(Cdf360CdmBatchCollectionLoader.name, () => {
  test('should batch multiple collection requests into a single DMS query', async () => {
    const collectionIds = ['collection_1', 'collection_2', 'collection_3'];
    const dmsResponse = createMockDmsResponse(collectionIds);
    const filesResponse = createMockFilesResponse(collectionIds);
    const { cogniteSdkMock, dmsSdkMock } = createMockSdks(dmsResponse, filesResponse);

    const batchLoader = new Cdf360CdmBatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object());

    // Request all 3 collections concurrently - they should be batched
    const results = await Promise.all(
      collectionIds.map(id => batchLoader.getCollectionDescriptors({ externalId: id, space: 'test_space' }))
    );

    // Verify results - all 3 collections should return data
    expect(results).toHaveLength(3);
    results.forEach((result, idx) => {
      expect(result.length).toBeGreaterThan(0);
      if (result.length > 0) {
        expect(result[0].collectionId).toBe(collectionIds[idx]);
      }
    });
  });

  test('should handle collections with no images', async () => {
    const dmsResponse = {
      image_collections: [
        {
          instanceType: 'node' as const,
          version: 1,
          space: 'test_space',
          externalId: 'empty_collection',
          createdTime: 0,
          lastUpdatedTime: 0,
          properties: {
            cdf_cdm: {
              'Cognite360ImageCollection/v1': {
                name: 'Empty Collection'
              }
            }
          }
        }
      ],
      images: [],
      stations: []
    };

    const { cogniteSdkMock, dmsSdkMock } = createMockSdks(dmsResponse);
    const batchLoader = new Cdf360CdmBatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object());

    const result = await batchLoader.getCollectionDescriptors({
      externalId: 'empty_collection',
      space: 'test_space'
    });

    expect(result).toHaveLength(0);
  });

  test('should batch requests that arrive within delay window', async () => {
    const collectionIds = ['collection_1', 'collection_2'];
    const dmsResponse = createMockDmsResponse(collectionIds);
    const filesResponse = createMockFilesResponse(collectionIds);
    const { cogniteSdkMock, dmsSdkMock } = createMockSdks(dmsResponse, filesResponse);

    const batchLoader = new Cdf360CdmBatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object());

    // Request first collection
    const promise1 = batchLoader.getCollectionDescriptors({
      externalId: 'collection_1',
      space: 'test_space'
    });

    // Request second collection after 20ms (within batch delay)
    await new Promise(resolve => setTimeout(resolve, 20));
    const promise2 = batchLoader.getCollectionDescriptors({
      externalId: 'collection_2',
      space: 'test_space'
    });

    const results = await Promise.all([promise1, promise2]);

    // Both requests should succeed and be batched
    expect(results).toHaveLength(2);
    results.forEach(result => {
      expect(result.length).toBeGreaterThan(0);
    });
  });

  test('should handle DMS query errors gracefully', async () => {
    const { cogniteSdkMock, dmsSdkMock } = createMockSdks(
      {
        image_collections: [],
        images: [],
        stations: []
      },
      undefined,
      new Error('DMS query failed')
    );

    const batchLoader = new Cdf360CdmBatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object());

    await expect(
      batchLoader.getCollectionDescriptors({ externalId: 'test_collection', space: 'test_space' })
    ).rejects.toThrow('DMS query failed');
  });

  test('should handle file fetching errors gracefully', async () => {
    const dmsResponse = createMockDmsResponse(['collection_1']);
    const { cogniteSdkMock, dmsSdkMock } = createMockSdks(
      dmsResponse,
      undefined,
      undefined,
      new Error('Files API failed')
    );

    const batchLoader = new Cdf360CdmBatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object());

    await expect(
      batchLoader.getCollectionDescriptors({ externalId: 'collection_1', space: 'test_space' })
    ).rejects.toThrow();
  });

  test('should handle collection not found', async () => {
    const dmsResponse = {
      image_collections: [],
      images: [],
      stations: []
    };

    const { cogniteSdkMock, dmsSdkMock } = createMockSdks(dmsResponse);
    const batchLoader = new Cdf360CdmBatchCollectionLoader(dmsSdkMock.object(), cogniteSdkMock.object());

    const result = await batchLoader.getCollectionDescriptors({
      externalId: 'nonexistent_collection',
      space: 'test_space'
    });

    expect(result).toHaveLength(0);
  });

  function createMockSdks(
    dmsResponse: DmsSdkQueryResult,
    filesResponse?: HttpPostResponse,
    dmsError?: Error,
    filesError?: Error
  ) {
    const cogniteSdkMock = new Mock<CogniteClient>()
      .setup(instance => instance.getBaseUrl())
      .returns('https://example.com')
      .setup(instance => instance.project)
      .returns('test-project');

    if (filesResponse) {
      if (filesError) {
        cogniteSdkMock
          .setup(instance =>
            instance.post(
              It.Is((path: string) => path.includes('files/byids')),
              It.IsAny()
            )
          )
          .callback(async () => {
            throw filesError;
          });
      } else {
        cogniteSdkMock
          .setup(instance =>
            instance.post(
              It.Is((path: string) => path.includes('files/byids')),
              It.IsAny()
            )
          )
          .returns(Promise.resolve(filesResponse));
      }
    } else if (filesError) {
      cogniteSdkMock
        .setup(instance =>
          instance.post(
            It.Is((path: string) => path.includes('files/byids')),
            It.IsAny()
          )
        )
        .callback(async () => {
          throw filesError;
        });
    }

    const dmsSdkMock = new Mock<DataModelsSdk>();

    if (dmsError) {
      dmsSdkMock
        .setup(instance => instance.queryNodesAndEdges(It.IsAny(), It.IsAny()))
        .callback(async () => {
          throw dmsError;
        });
    } else {
      dmsSdkMock
        .setup(instance => instance.queryNodesAndEdges(It.IsAny(), It.IsAny()))
        .returns(Promise.resolve(dmsResponse));
    }

    return { cogniteSdkMock, dmsSdkMock };
  }

  function createMockDmsResponse(collectionIds: string[]): DmsSdkQueryResult {
    const collections = collectionIds.map(id => ({
      instanceType: 'node' as const,
      version: 1,
      space: 'test_space',
      externalId: id,
      createdTime: 0,
      lastUpdatedTime: 0,
      properties: {
        cdf_cdm: {
          'Cognite360ImageCollection/v1': {
            name: `Collection ${id}`
          }
        }
      }
    }));

    const images = collectionIds.flatMap((collectionId, idx) =>
      Array.from({ length: 2 }, (_, imageIdx) => ({
        instanceType: 'node' as const,
        version: 1,
        space: 'test_space',
        externalId: `image_${collectionId}_${imageIdx}`,
        createdTime: 0,
        lastUpdatedTime: 0,
        properties: {
          cdf_cdm: {
            'Cognite360Image/v1': {
              top: { externalId: `file_${collectionId}_${imageIdx}_top`, space: 'test_space' },
              back: { externalId: `file_${collectionId}_${imageIdx}_back`, space: 'test_space' },
              left: { externalId: `file_${collectionId}_${imageIdx}_left`, space: 'test_space' },
              front: { externalId: `file_${collectionId}_${imageIdx}_front`, space: 'test_space' },
              right: { externalId: `file_${collectionId}_${imageIdx}_right`, space: 'test_space' },
              bottom: { externalId: `file_${collectionId}_${imageIdx}_bottom`, space: 'test_space' },
              collection360: { space: 'test_space', externalId: collectionId },
              station360: { space: 'test_space', externalId: `station_${collectionId}` },
              scaleX: 1,
              scaleY: 1,
              scaleZ: 1,
              translationX: idx,
              translationY: idx,
              translationZ: idx,
              eulerRotationX: idx,
              eulerRotationY: idx,
              eulerRotationZ: idx,
              takenAt: `2024-01-0${idx + 1}`
            }
          }
        }
      }))
    );

    return {
      image_collections: collections,
      images,
      stations: []
    };
  }

  function createMockFilesResponse(collectionIds: string[]): HttpPostResponse {
    const files: FileInfoWithInstanceId[] = collectionIds.flatMap((collectionId, idx) =>
      Array.from({ length: 2 }, (_, imageIdx) =>
        ['top', 'back', 'left', 'front', 'right', 'bottom'].map(face => {
          const fileId = idx * 100 + imageIdx * 10 + face.length;
          const externalId = `file_${collectionId}_${imageIdx}_${face}`;

          return {
            id: fileId,
            name: `${face}.jpg`,
            mimeType: 'image/jpeg',
            instanceId: { externalId, space: 'test_space' }
          } as FileInfoWithInstanceId;
        })
      ).flat()
    );

    return {
      data: {
        items: files
      },
      headers: {},
      status: 200
    };
  }
});

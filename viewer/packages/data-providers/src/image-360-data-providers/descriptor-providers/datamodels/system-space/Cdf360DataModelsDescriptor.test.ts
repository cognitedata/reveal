/*!
 * Copyright 2023 Cognite AS
 */

import { vi } from 'vitest';
import type { CogniteClient, FileInfo, HttpResponse } from '@cognite/sdk';
import { Cdf360DataModelsDescriptorProvider } from './Cdf360DataModelsDescriptorProvider';
import { It, Mock } from 'moq.ts';

const mock = {
  headers: {
    'access-control-allow-credentials': 'false',
    'access-control-allow-headers':
      'accept,accept-language,content-type,content-language,content-range,origin,authorization,api-key,auth-ticket,cdf-version,cdf-experiments,env,x-cdp-app,x-cdp-clienttag,x-cdp-sdk,x-ms-blob-content-type,x-upload-content-type,x-user-agent',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD',
    'access-control-allow-origin': '*',
    'access-control-expose-headers': 'x-request-id',
    'access-control-max-age': '7200',
    connection: 'close',
    'content-encoding': 'gzip',
    'content-length': '6542',
    'content-type': 'application/json',
    date: 'Thu, 16 Nov 2023 14:46:45 GMT',
    server: 'envoy',
    'strict-transport-security': 'max-age=31536000',
    vary: 'Accept-Encoding',
    'x-envoy-upstream-service-time': '143',
    'x-request-id': '87518dc6-0c61-9ef0-9588-94f61ab5a450'
  },
  status: 200,
  data: {
    items: {
      image_collection: [
        {
          instanceType: 'node',
          version: 1,
          space: 'test_space',
          externalId: 'test_collection',
          createdTime: 0,
          lastUpdatedTime: 0,
          properties: {
            cdf_360_image_schema: {
              'Image360Collection/v1': {
                label: 'Test Collection'
              }
            }
          }
        }
      ],
      images: [
        {
          instanceType: 'node',
          version: 1,
          space: 'test_space',
          externalId: 'test_image_1',
          createdTime: 0,
          lastUpdatedTime: 0,
          properties: {
            cdf_360_image_schema: {
              'Image360/v1': {
                cubeMapTop: 'test_image_1_Top',
                cubeMapBack: 'test_image_1_Back',
                cubeMapLeft: 'test_image_1_Left',
                cubeMapFront: 'test_image_1_Front',
                cubeMapRight: 'test_image_1_Right',
                cubeMapBottom: 'test_image_1_Bottom',
                label: '',
                collection360: {
                  space: 'test_space',
                  externalId: 'test_collection'
                },
                scaleX: 1,
                scaleY: 1,
                scaleZ: 1,
                translationX: 0,
                translationY: 0,
                translationZ: 0,
                eulerRotationX: 0,
                eulerRotationY: 0,
                eulerRotationZ: 0
              }
            }
          }
        },
        {
          instanceType: 'node',
          version: 1,
          space: 'test_space',
          externalId: 'test_image_2',
          createdTime: 0,
          lastUpdatedTime: 0,
          properties: {
            cdf_360_image_schema: {
              'Image360/v1': {
                cubeMapTop: 'test_image_2_Top',
                cubeMapBack: 'test_image_2_Back',
                cubeMapLeft: 'test_image_2_Left',
                cubeMapFront: 'test_image_2_Front',
                cubeMapRight: 'test_image_2_Right',
                cubeMapBottom: 'test_image_2_Bottom',
                label: '',
                collection360: {
                  space: 'test_space',
                  externalId: 'test_collection'
                },
                scaleX: 1,
                scaleY: 1,
                scaleZ: 1,
                translationX: 1,
                translationY: 1,
                translationZ: 1,
                eulerRotationX: 1,
                eulerRotationY: 1,
                eulerRotationZ: 1
              }
            }
          }
        },
        {
          instanceType: 'node',
          version: 1,
          space: 'test_space',
          externalId: 'test_image_3',
          createdTime: 0,
          lastUpdatedTime: 0,
          properties: {
            cdf_360_image_schema: {
              'Image360/v1': {
                cubeMapTop: 'test_image_3_Top',
                cubeMapBack: 'test_image_3_Back',
                cubeMapLeft: 'test_image_3_Left',
                cubeMapFront: 'test_image_3_Front',
                cubeMapRight: 'test_image_3_Right',
                cubeMapBottom: 'test_image_3_Bottom',
                label: '',
                collection360: {
                  space: 'test_space',
                  externalId: 'test_collection'
                },
                scaleX: 1,
                scaleY: 1,
                scaleZ: 1,
                translationX: 3,
                translationY: 3,
                translationZ: 3,
                eulerRotationX: 3,
                eulerRotationY: 3,
                eulerRotationZ: 3
              }
            }
          }
        }
      ],
      stations: []
    }
  }
};

describe(Cdf360DataModelsDescriptorProvider.name, () => {
  test('returns descriptors with externalId for each image', async () => {
    const sdkMock = new Mock<CogniteClient>()
      .setup(instance => instance.post(It.IsAny(), It.IsAny()))
      .returns(Promise.resolve(mock))
      .setup(instance => instance.getBaseUrl())
      .returns('https://example.com');

    const provider = new Cdf360DataModelsDescriptorProvider(sdkMock.object());

    const descriptors = await provider.get360ImageDescriptors(
      {
        source: 'dm',
        space: 'test_space',
        image360CollectionExternalId: 'test_collection'
      },
      true
    );

    expect(descriptors.length).toBe(3);
  });

  test('file descriptors use externalId instead of fileId', async () => {
    const sdkMock = new Mock<CogniteClient>()
      .setup(instance => instance.post(It.IsAny(), It.IsAny()))
      .returns(Promise.resolve(mock))
      .setup(instance => instance.getBaseUrl())
      .returns('https://example.com');

    const provider = new Cdf360DataModelsDescriptorProvider(sdkMock.object());

    const descriptors = await provider.get360ImageDescriptors(
      {
        source: 'dm',
        space: 'test_space',
        image360CollectionExternalId: 'test_collection'
      },
      true
    );

    expect(descriptors.length).toBe(3);

    const firstDescriptor = descriptors[0];
    const faceDescriptors = firstDescriptor.imageRevisions[0].faceDescriptors;

    expect(faceDescriptors.length).toBe(6);
    faceDescriptors.forEach(fd => {
      expect(fd.externalId).toBeDefined();
      expect(fd.fileId).toBeUndefined();
      expect(fd.mimeType).toBe('image/jpeg');
    });

    const frontFace = faceDescriptors.find(fd => fd.face === 'front');
    expect(frontFace?.externalId).toBe('test_image_1_Front');
  });

  test('does not call files.retrieve API', async () => {
    const filesRetrieveMock = vi.fn<() => Promise<FileInfo[]>>();

    const sdkMock = new Mock<CogniteClient>()
      .setup(instance => instance.post(It.IsAny(), It.IsAny()))
      .returns(Promise.resolve(mock))
      .setup(instance => instance.getBaseUrl())
      .returns('https://example.com')
      .setup(instance => instance.files.retrieve(It.IsAny()))
      .callback(() => {
        filesRetrieveMock();
        return Promise.resolve([]);
      });

    const provider = new Cdf360DataModelsDescriptorProvider(sdkMock.object());

    await provider.get360ImageDescriptors(
      {
        source: 'dm',
        space: 'test_space',
        image360CollectionExternalId: 'test_collection'
      },
      true
    );

    expect(filesRetrieveMock).not.toHaveBeenCalled();
  });

  describe('batched collection loading', () => {
    type QueryBody = {
      cursors?: { images?: string; stations?: string };
      with: {
        image_collection: { nodes: { filter: { instanceReferences: { space: string; externalId: string }[] } } };
      };
    };

    const imagesPageLimit = 10000;

    function createImage(externalId: string, collectionExternalId: string) {
      const image = structuredClone(mock.data.items.images[0]);
      image.externalId = externalId;
      image.properties.cdf_360_image_schema['Image360/v1'].collection360 = {
        space: 'test_space',
        externalId: collectionExternalId
      };
      return image;
    }

    function createCollection(externalId: string) {
      const collection = structuredClone(mock.data.items.image_collection[0]);
      collection.externalId = externalId;
      return collection;
    }

    function createResponse(
      collectionIds: string[],
      images: ReturnType<typeof createImage>[],
      nextCursor?: { images: string; stations: string }
    ) {
      return {
        ...mock,
        data: { items: { image_collection: collectionIds.map(createCollection), images, stations: [] }, nextCursor }
      };
    }

    function createProvider(onPost: (body: QueryBody) => Promise<HttpResponse<unknown>> | HttpResponse<unknown>) {
      const sdkMock = new Mock<CogniteClient>()
        .setup(instance => instance.post(It.IsAny(), It.IsAny()))
        .callback(async ({ args }) => onPost(args[1]?.data))
        .setup(instance => instance.getBaseUrl())
        .returns('https://example.com');
      return new Cdf360DataModelsDescriptorProvider(sdkMock.object());
    }

    const identifierFor = (id: string) => ({
      source: 'dm' as const,
      space: 'test_space',
      image360CollectionExternalId: id
    });

    test('loads many collections with a few sequential queries and returns each collection its own images', async () => {
      const collectionCount = 120;
      let inFlight = 0;
      let maxInFlight = 0;
      let queryCount = 0;

      const provider = createProvider(async body => {
        queryCount++;
        inFlight++;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise(resolve => setTimeout(resolve, 1));
        inFlight--;
        const ids = body.with.image_collection.nodes.filter.instanceReferences.map(ref => ref.externalId);
        return createResponse(
          ids,
          ids.map(id => createImage(`${id}_image`, id))
        );
      });

      const ids = Array.from({ length: collectionCount }, (_, i) => `collection_${i}`);
      const results = await Promise.all(ids.map(id => provider.get360ImageDescriptors(identifierFor(id), true)));

      expect(queryCount).toBeLessThanOrEqual(Math.ceil(collectionCount / 50) + 1);
      expect(maxInFlight).toBe(1);
      results.forEach((descriptors, index) => {
        expect(descriptors.length).toBe(1);
        expect(descriptors[0].collectionId).toBe(ids[index]);
        expect(descriptors[0].id).toBe(`${ids[index]}_image`);
      });
    });

    test('returns no descriptors for a collection that is missing from the batched result', async () => {
      const provider = createProvider(() => createResponse(['present'], [createImage('present_image', 'present')]));

      const [present, missing] = await Promise.all([
        provider.get360ImageDescriptors(identifierFor('present'), true),
        provider.get360ImageDescriptors(identifierFor('missing'), true)
      ]);

      expect(present.length).toBe(1);
      expect(missing).toEqual([]);
    });

    test('follows the images cursor and assigns images from later pages to their collections', async () => {
      const bodies: QueryBody[] = [];
      const provider = createProvider(body => {
        bodies.push(body);
        if (body.cursors === undefined) {
          const fullPage = Array.from({ length: imagesPageLimit }, (_, i) => createImage(`a_${i}`, 'a'));
          return createResponse(['a', 'b'], fullPage, { images: 'images-cursor', stations: 'stations-cursor' });
        }
        return createResponse(['a', 'b'], [createImage('b_0', 'b')]);
      });

      const [a, b] = await Promise.all([
        provider.get360ImageDescriptors(identifierFor('a'), true),
        provider.get360ImageDescriptors(identifierFor('b'), true)
      ]);

      expect(bodies.length).toBe(2);
      expect(bodies[1].cursors).toEqual({ images: 'images-cursor', stations: 'stations-cursor' });
      expect(a.length).toBe(imagesPageLimit);
      expect(b.map(d => d.id)).toEqual(['b_0']);
    });

    test('rejects every collection in a batch when the query fails', async () => {
      const provider = createProvider(() => {
        throw new Error('query failed');
      });
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const results = await Promise.allSettled([
        provider.get360ImageDescriptors(identifierFor('a'), true),
        provider.get360ImageDescriptors(identifierFor('b'), true)
      ]);

      expect(results.map(r => r.status)).toEqual(['rejected', 'rejected']);
    });
  });
});

/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import type { CogniteClient, HttpResponse } from '@cognite/sdk';
import { It, Mock } from 'moq.ts';
import { DataModelsSdk } from '../../../../DataModelsSdk';
import { Cdf360DataModelsBatchCollectionLoader } from './Cdf360DataModelsBatchCollectionLoader';

type QueryBody = {
  cursors?: { images?: string; stations?: string };
  with: {
    image_collection: { nodes: { filter: { instanceReferences: { space: string; externalId: string }[] } } };
  };
};

const SPACE = 'test_space';
const IMAGES_PAGE_LIMIT = 10000;
const BATCH_SIZE = 50;

describe(Cdf360DataModelsBatchCollectionLoader.name, () => {
  function createImage(externalId: string, collectionExternalId: string) {
    return {
      space: SPACE,
      externalId,
      properties: {
        cdf_360_image_schema: {
          'Image360/v1': { collection360: { space: SPACE, externalId: collectionExternalId } }
        }
      }
    };
  }

  function createResponse(
    collectionIds: string[],
    images: ReturnType<typeof createImage>[],
    nextCursor?: { images: string; stations: string }
  ): HttpResponse<unknown> {
    return {
      status: 200,
      headers: {},
      data: {
        items: {
          image_collection: collectionIds.map(externalId => ({ space: SPACE, externalId })),
          images,
          stations: []
        },
        nextCursor
      }
    };
  }

  function createLoader(onPost: (body: QueryBody) => Promise<HttpResponse<unknown>> | HttpResponse<unknown>) {
    const sdkMock = new Mock<CogniteClient>()
      .setup(instance => instance.post(It.IsAny(), It.IsAny()))
      .callback(async ({ args }) => onPost(args[1]?.data))
      .setup(instance => instance.getBaseUrl())
      .returns('https://example.com');
    return new Cdf360DataModelsBatchCollectionLoader(new DataModelsSdk(sdkMock.object()));
  }

  const refFor = (externalId: string) => ({ space: SPACE, externalId });

  test('loads many collections with sequential batched queries and returns each collection its own images', async () => {
    const collectionCount = 120;
    let inFlight = 0;
    let maxInFlight = 0;
    let queryCount = 0;

    const loader = createLoader(async body => {
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
    const results = await Promise.all(ids.map(id => loader.getCollection(refFor(id))));

    expect(queryCount).toBe(Math.ceil(collectionCount / BATCH_SIZE));
    expect(maxInFlight).toBe(1);
    results.forEach((result, index) => {
      expect(result.image_collection.map(c => c.externalId)).toEqual([ids[index]]);
      expect(result.images.map(image => image.externalId)).toEqual([`${ids[index]}_image`]);
    });
  });

  test('returns an empty result for a collection that is missing from the batched result', async () => {
    const loader = createLoader(() => createResponse(['present'], [createImage('present_image', 'present')]));

    const [present, missing] = await Promise.all([
      loader.getCollection(refFor('present')),
      loader.getCollection(refFor('missing'))
    ]);

    expect(present.images.map(image => image.externalId)).toEqual(['present_image']);
    expect(missing).toEqual({ image_collection: [], images: [] });
  });

  test('follows the images cursor and assigns images from later pages to their collections', async () => {
    const bodies: QueryBody[] = [];
    const loader = createLoader(body => {
      bodies.push(body);
      if (body.cursors === undefined) {
        const fullPage = Array.from({ length: IMAGES_PAGE_LIMIT }, (_, i) => createImage(`a_${i}`, 'a'));
        return createResponse(['a', 'b'], fullPage, { images: 'images-cursor', stations: 'stations-cursor' });
      }
      return createResponse(['a', 'b'], [createImage('b_0', 'b')]);
    });

    const [a, b] = await Promise.all([loader.getCollection(refFor('a')), loader.getCollection(refFor('b'))]);

    expect(bodies.length).toBe(2);
    expect(bodies[1].cursors).toEqual({ images: 'images-cursor', stations: 'stations-cursor' });
    expect(a.images.length).toBe(IMAGES_PAGE_LIMIT);
    expect(b.images.map(image => image.externalId)).toEqual(['b_0']);
  });

  test('rejects every collection in a batch when the query fails', async () => {
    const loader = createLoader(() => {
      throw new Error('query failed');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const results = await Promise.allSettled([loader.getCollection(refFor('a')), loader.getCollection(refFor('b'))]);

    expect(results.map(r => r.status)).toEqual(['rejected', 'rejected']);
  });
});

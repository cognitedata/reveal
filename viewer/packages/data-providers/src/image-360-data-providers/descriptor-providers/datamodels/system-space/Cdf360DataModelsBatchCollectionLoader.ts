/*!
 * Copyright 2026 Cognite AS
 */

import type { DMInstanceKey, DMInstanceRef } from '@reveal/utilities';
import { dmInstanceRefToKey, isDmIdentifier } from '@reveal/utilities';
import type { DataModelsSdk } from '../../../../DataModelsSdk';
import { BatchLoader } from '../../../../utilities/BatchLoader';
import type { Cdf360FdmBatchQuery } from './get360CollectionQuery';
import { get360CollectionsQuery } from './get360CollectionQuery';

type QueryResult = Awaited<ReturnType<typeof DataModelsSdk.prototype.queryNodesAndEdges<Cdf360FdmBatchQuery>>>;

export type LegacyCollectionQueryResult = {
  image_collection: QueryResult['image_collection'];
  images: QueryResult['images'];
};

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 50;
const IMAGES_PAGE_LIMIT = 10000;

/**
 * Batches the DMS queries for many legacy (system-space) 360 image collections.
 * Collections requested close together are loaded with one query (and its image pages),
 * and only one batch is in flight at a time, so loading N collections no longer fires
 * N concurrent query chains.
 */
export class Cdf360DataModelsBatchCollectionLoader extends BatchLoader<DMInstanceRef, LegacyCollectionQueryResult> {
  private readonly _dmsSdk: DataModelsSdk;

  constructor(dmsSdk: DataModelsSdk) {
    super(BATCH_SIZE, BATCH_DELAY_MS);
    this._dmsSdk = dmsSdk;
  }

  public getCollection(identifier: DMInstanceRef): Promise<LegacyCollectionQueryResult> {
    return this.load(identifier);
  }

  protected async fetchBatch(identifiers: DMInstanceRef[]): Promise<Map<DMInstanceKey, LegacyCollectionQueryResult>> {
    const query = get360CollectionsQuery(identifiers);
    const all = await this.fetchAllPages(query);
    return this.groupByCollection(all);
  }

  protected getKeyForIdentifier(identifier: DMInstanceRef): DMInstanceKey {
    return dmInstanceRefToKey(identifier);
  }

  protected getDefaultResult(_identifier: DMInstanceRef): LegacyCollectionQueryResult {
    return { image_collection: [], images: [] };
  }

  private async fetchAllPages(query: Cdf360FdmBatchQuery): Promise<LegacyCollectionQueryResult> {
    // Stations are paged together with the images (their cursor is needed for pagination), but the
    // descriptor mapping only reads the station reference from each image, so they are not kept.
    const result: LegacyCollectionQueryResult = { image_collection: [], images: [] };

    let nextCursor: { images: string; stations: string } | undefined;
    let hasNext = true;

    while (hasNext) {
      const page: QueryResult = await this._dmsSdk.queryNodesAndEdges(query, nextCursor);
      if (result.image_collection.length === 0) {
        result.image_collection.push(...page.image_collection);
      }
      result.images.push(...page.images);

      const imagesCursor = page.nextCursor?.images;
      const stationsCursor = page.nextCursor?.stations;
      if (page.images.length === IMAGES_PAGE_LIMIT && imagesCursor !== undefined && stationsCursor !== undefined) {
        nextCursor = { images: imagesCursor, stations: stationsCursor };
      } else {
        hasNext = false;
      }
    }

    return result;
  }

  private groupByCollection(all: LegacyCollectionQueryResult): Map<DMInstanceKey, LegacyCollectionQueryResult> {
    const grouped = new Map<DMInstanceKey, LegacyCollectionQueryResult>();

    for (const collection of all.image_collection) {
      grouped.set(dmInstanceRefToKey(collection), { image_collection: [collection], images: [] });
    }

    for (const image of all.images) {
      const collectionRef = image.properties?.cdf_360_image_schema?.['Image360/v1']?.collection360;
      if (!isDmIdentifier(collectionRef)) {
        continue;
      }
      grouped.get(dmInstanceRefToKey(collectionRef))?.images.push(image);
    }

    return grouped;
  }
}

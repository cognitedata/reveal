/*!
 * Copyright 2025 Cognite AS
 */

import { CogniteClient, DirectRelationReference, FileInfo, RawPropertyValueV3 } from '@cognite/sdk';
import { DataModelsSdk } from '../../../../DataModelsSdk';
import { get360CdmCollectionsQuery, CdfImage360CollectionDmQuery } from './get360CdmCollectionsQuery';
import type {
  Historical360ImageSet,
  Image360Descriptor,
  Image360FileDescriptor,
  Image360RevisionId
} from '../../../../types';
import type { DMDataSourceType } from '../../../../DataSourceType';
import chunk from 'lodash/chunk';
import groupBy from 'lodash/groupBy';
import partition from 'lodash/partition';
import { Euler, Matrix4 } from 'three';
import { BATCH_SIZE, BATCH_DELAY_MS } from '../../../../utilities/constants';
import { DMInstanceRef, dmInstanceRefToKey, isDefined, isDmIdentifier } from '@reveal/utilities';
import { BatchLoader } from '../../../../utilities/BatchLoader';

// DMS query result type - using batch query structure
type QueryResult = Awaited<ReturnType<typeof DataModelsSdk.prototype.queryNodesAndEdges<CdfImage360CollectionDmQuery>>>;

type ImageInstanceResult = QueryResult['images'][number];
type ImageResultProperties = ImageInstanceResult['properties']['cdf_cdm']['Cognite360Image/v1'];

// Collection types - batch query uses 'image_collections' (plural)
type CollectionInstanceResult = QueryResult['image_collections'][number];

type BatchQueryResult = {
  image_collections: CollectionInstanceResult[];
  images: ImageInstanceResult[];
  stations?: DMInstanceRef[];
  nextCursor?: Record<string, string>;
};

interface FileInfoWithInstanceId extends FileInfo {
  instanceId?: DirectRelationReference;
}

/**
 * Coordinates batched loading of multiple 360 image collections.
 * Instead of loading each collection individually (1000 queries for 1000 collections),
 * it batches them into groups and makes far fewer queries (e.g., 20 queries for 1000 collections).
 *
 * Handles DMS API pagination automatically: If a batch exceeds the 10,000 item limit,
 * additional queries are made to fetch all data. This allows collections with any number
 * of images, not just ~200 per collection (10,000 / 50 batch size).
 */
export class Cdf360CdmBatchCollectionLoader extends BatchLoader<
  DMInstanceRef,
  Historical360ImageSet<DMDataSourceType>[]
> {
  private readonly _dmsSdk: DataModelsSdk;
  private readonly _cogniteSdk: CogniteClient;

  constructor(dmsSdk: DataModelsSdk, cogniteSdk: CogniteClient) {
    super(BATCH_SIZE, BATCH_DELAY_MS);
    this._dmsSdk = dmsSdk;
    this._cogniteSdk = cogniteSdk;
  }

  /**
   * Request descriptors for a collection. This will be batched with other concurrent requests.
   * Batches are processed sequentially to avoid overwhelming the API.
   */
  public async getCollectionDescriptors(identifier: DMInstanceRef): Promise<Historical360ImageSet<DMDataSourceType>[]> {
    return this.load(identifier);
  }

  /**
   * Fetch a batch of collection descriptors from DMS.
   * This method is called by the base BatchLoader class.
   */
  protected async fetchBatch(
    identifiers: DMInstanceRef[]
  ): Promise<Map<string, Historical360ImageSet<DMDataSourceType>[]>> {
    // Execute batch query directly - no throttling needed
    // The batching itself (BATCH_SIZE queries instead of 1000) prevents API overload
    const query = get360CdmCollectionsQuery(identifiers);

    // Fetch all pages if data exceeds DMS API limit
    const allResults = await this.fetchAllPages(query);

    // Group results by collection
    return this.groupResultsByCollection(allResults);
  }

  /**
   * Convert a DMInstanceRef to a string key for result mapping.
   */
  protected getKeyForIdentifier(identifier: DMInstanceRef): string {
    return dmInstanceRefToKey(identifier);
  }

  /**
   * Return an empty array when a collection is not found.
   */
  protected getDefaultResult(_identifier: DMInstanceRef): Historical360ImageSet<DMDataSourceType>[] {
    console.warn(`[${Cdf360CdmBatchCollectionLoader.name}] Collection not found: ${dmInstanceRefToKey(_identifier)}`);
    return [];
  }

  /**
   * Fetches all pages of results if data exceeds the DMS API limit of 10,000 items.
   * This allows handling collections with more than 200 images on average (10,000 / 50 batch size).
   *
   * Note: DMS API always returns nextCursor, but returns empty arrays when no more data exists.
   */
  private async fetchAllPages(query: CdfImage360CollectionDmQuery): Promise<BatchQueryResult> {
    let currentCursor: Record<string, string> | undefined;
    const accumulatedResults: BatchQueryResult = {
      image_collections: [],
      images: [],
      stations: []
    };

    // Keep fetching until no more pages
    do {
      const result = await this._dmsSdk.queryNodesAndEdges<CdfImage360CollectionDmQuery>(query, currentCursor);

      // Handle case where result might be undefined or missing properties
      if (!result) {
        break;
      }

      // Check if this page has any data
      const hasDataInPage =
        (result.image_collections && result.image_collections.length > 0) ||
        (result.images && result.images.length > 0) ||
        (result.stations && result.stations.length > 0);

      if (!hasDataInPage) {
        // No more data to fetch (empty arrays indicate end of pagination)
        break;
      }

      // Accumulate results from this page
      if (result.image_collections) {
        accumulatedResults.image_collections = [...accumulatedResults.image_collections, ...result.image_collections];
      }
      if (result.images) {
        accumulatedResults.images = [...accumulatedResults.images, ...result.images];
      }
      if (result.stations) {
        accumulatedResults.stations = [...(accumulatedResults.stations || []), ...result.stations];
      }

      // Update cursor for next page
      currentCursor = result.nextCursor;

      // Stop if no cursor (backward compat with mocks/older implementations)
      if (!currentCursor) {
        break;
      }
    } while (true);

    return accumulatedResults;
  }

  private async groupResultsByCollection(
    result: BatchQueryResult
  ): Promise<Map<string, Historical360ImageSet<DMDataSourceType>[]>> {
    const grouped = new Map<string, Historical360ImageSet<DMDataSourceType>[]>();

    if (!result.image_collections || !result.images) {
      console.warn(`[${Cdf360CdmBatchCollectionLoader.name}] Missing image_collections or images in result:`, {
        hasCollections: !!result.image_collections,
        hasImages: !!result.images
      });
      return grouped;
    }

    // Get file descriptors for all images in batch
    const allFileDescriptors = await this.getFileDescriptorsForBatch(result.images);

    // Group images by their collection
    const imagesByCollection = new Map<string, ImageInstanceResult[]>();

    result.images.forEach(image => {
      const collectionRef = image.properties?.cdf_cdm?.['Cognite360Image/v1']?.collection360;
      if (isDmIdentifier(collectionRef)) {
        const key = dmInstanceRefToKey(collectionRef);
        if (!imagesByCollection.has(key)) {
          imagesByCollection.set(key, []);
        }
        imagesByCollection.get(key)?.push(image);
      }
    });

    // Process each collection
    result.image_collections.forEach(collection => {
      const collectionKey = dmInstanceRefToKey(collection);
      const collectionImages = imagesByCollection.get(collectionKey) ?? [];

      if (collectionImages.length === 0) {
        grouped.set(collectionKey, []);
        return;
      }

      const collectionId = collection.externalId;
      const name = collection.properties?.cdf_cdm?.['Cognite360ImageCollection/v1']?.name;
      const collectionLabel = typeof name === 'string' ? name : typeof name === 'number' ? String(name) : undefined;

      // Get paired image and file descriptor data for this collection's images
      const imagesWithFiles = this.getFileDescriptorsForImages(collectionImages, allFileDescriptors);

      // Create Historical360ImageSet
      const historicalSets = this.createHistoricalImageSets(
        collectionId,
        collectionLabel ?? collectionId,
        imagesWithFiles
      );

      grouped.set(collectionKey, historicalSets);
    });

    return grouped;
  }

  private async getFileDescriptorsForBatch(images: ImageInstanceResult[]): Promise<Map<string, FileInfo>> {
    const imageProps = images.map(image => image.properties.cdf_cdm['Cognite360Image/v1']);
    const cubeMapFileIds = imageProps.flatMap(imageProp => {
      const faces = [imageProp.front, imageProp.back, imageProp.left, imageProp.right, imageProp.top, imageProp.bottom];
      return faces.filter(isDmIdentifier);
    });

    // Batch file requests - reduce to 100 per batch to avoid timeout
    // The /files/byids endpoint seems to have performance issues with large batches
    const batchSize = 100;
    const batches = chunk(cubeMapFileIds, batchSize);

    const fileInfos: FileInfo[] = [];

    // Process batches sequentially
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      try {
        const batchFileInfos = await this.getCdmFiles(batch);
        fileInfos.push(...batchFileInfos);
      } catch (error) {
        console.error(`Failed to fetch file batch ${i + 1}/${batches.length}:`, error);
        throw error;
      }
    }

    // Create map for quick lookup by externalId:space
    // DMS DirectRelationReference uses { space: "...", externalId: "..." }
    // where externalId is a string UUID, not a numeric ID
    const fileMap = new Map<string, FileInfo>();

    fileInfos.forEach(file => {
      // The /files/byids response includes the instanceId (DirectRelationReference) in the file object
      const fileWithInstanceId = file as FileInfoWithInstanceId;
      const instanceId = fileWithInstanceId.instanceId;

      if (instanceId) {
        // Use the instanceId from the response to create the key
        const key = dmInstanceRefToKey(instanceId);
        fileMap.set(key, file);
      } else {
        console.warn(`[${Cdf360CdmBatchCollectionLoader.name}] File ${file.id} missing instanceId in response`);
      }
    });

    return fileMap;
  }

  /**
   * Get file descriptors for each image, returning explicit pairs of image and its files.
   * This avoids implicit assumptions about array ordering.
   */
  private getFileDescriptorsForImages(
    images: ImageInstanceResult[],
    fileMap: Map<string, FileInfo>
  ): Array<{ image: ImageInstanceResult; fileDescriptors: FileInfo[] }> {
    return images.map(image => {
      const props = image.properties.cdf_cdm['Cognite360Image/v1'];
      const faces = [props.front, props.back, props.left, props.right, props.top, props.bottom];

      const fileDescriptors = faces
        .filter(isDmIdentifier)
        .map(ref => {
          // Create the same key format used in the file map
          const key = dmInstanceRefToKey(ref);
          return fileMap.get(key);
        })
        .filter(isDefined);

      return { image, fileDescriptors };
    });
  }

  private createHistoricalImageSets(
    collectionId: string,
    collectionLabel: string,
    imagesWithFiles: Array<{ image: ImageInstanceResult; fileDescriptors: FileInfo[] }>
  ): Historical360ImageSet<DMDataSourceType>[] {
    // Filter out images that don't have all 6 face files
    const imagesGroupedWithFileDescriptors = imagesWithFiles.filter(
      ({ fileDescriptors }) => fileDescriptors.length === 6
    );

    const [imagesWithoutStation, imagesWithStation] = partition(imagesGroupedWithFileDescriptors, image => {
      const station = image.image.properties.cdf_cdm['Cognite360Image/v1'].station360;
      return !isDmIdentifier(station);
    });

    const groups = groupBy(imagesWithStation, imageResult => {
      const station = imageResult.image.properties.cdf_cdm['Cognite360Image/v1'].station360;
      if (isDmIdentifier(station)) {
        return `${station.externalId}-${station.space}`;
      }
      return 'unknown';
    });

    return Object.values(groups)
      .concat(imagesWithoutStation.map(p => [p]))
      .map(imageWithFileDescriptors => {
        return this.getHistorical360ImageSet(collectionId, collectionLabel, imageWithFileDescriptors);
      });
  }

  private getHistorical360ImageSet(
    collectionId: string,
    collectionLabel: string,
    imageFileDescriptors: { image: ImageInstanceResult; fileDescriptors: FileInfo[] }[]
  ): Historical360ImageSet<DMDataSourceType> {
    const mainImagePropsArray = imageFileDescriptors.map(
      descriptor => descriptor.image.properties.cdf_cdm['Cognite360Image/v1']
    );

    const id = imageFileDescriptors[0].image;
    return {
      collectionId,
      collectionLabel,
      id,
      imageRevisions: imageFileDescriptors.map((p, index) =>
        this.getImageRevision(
          { externalId: p.image.externalId, space: p.image.space },
          mainImagePropsArray[index],
          p.fileDescriptors
        )
      ),
      label: '',
      transform: this.getRevisionTransform(mainImagePropsArray[0])
    };
  }

  private getImageRevision(
    revisionId: Image360RevisionId<DMDataSourceType>,
    imageProps: ImageResultProperties,
    fileInfos: FileInfo[]
  ): Image360Descriptor<DMDataSourceType> {
    const timestamp = imageProps.takenAt;
    return {
      id: revisionId,
      faceDescriptors: this.getFaceDescriptors(fileInfos),
      timestamp:
        typeof timestamp === 'string' ? timestamp : typeof timestamp === 'number' ? String(timestamp) : undefined
    };
  }

  private getFaceDescriptors(fileInfos: FileInfo[]): Image360FileDescriptor[] {
    return [
      { fileId: fileInfos[0].id, face: 'front', mimeType: fileInfos[0].mimeType! },
      { fileId: fileInfos[1].id, face: 'back', mimeType: fileInfos[1].mimeType! },
      { fileId: fileInfos[2].id, face: 'left', mimeType: fileInfos[2].mimeType! },
      { fileId: fileInfos[3].id, face: 'right', mimeType: fileInfos[3].mimeType! },
      { fileId: fileInfos[4].id, face: 'top', mimeType: fileInfos[4].mimeType! },
      { fileId: fileInfos[5].id, face: 'bottom', mimeType: fileInfos[5].mimeType! }
    ] as Image360FileDescriptor[];
  }

  private getRevisionTransform(revision: ImageResultProperties): Matrix4 {
    const [x, y, z] = [
      this.toNumber(revision.translationX),
      this.toNumber(revision.translationY),
      this.toNumber(revision.translationZ)
    ];
    const translation = new Matrix4().makeTranslation(x, z, -y);

    const [rx, ry, rz] = [
      this.toNumber(revision.eulerRotationX),
      this.toNumber(revision.eulerRotationY),
      this.toNumber(revision.eulerRotationZ)
    ];
    const eulerRotation = new Euler(rx, rz, -ry, 'XYZ');
    const rotation = new Matrix4().makeRotationFromEuler(eulerRotation);

    return translation.multiply(rotation);
  }

  private async getCdmFiles(identifiers: DirectRelationReference[]): Promise<FileInfo[]> {
    try {
      const result = await this._cogniteSdk.files.retrieve(identifiers.map(id => ({ instanceId: id })));

      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch CDM files: ${error.message}`);
      }
      throw new Error(`Failed to fetch CDM files: ${JSON.stringify(error)}`);
    }
  }

  private toNumber(value: RawPropertyValueV3): number {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const num = parseFloat(value);
      if (isFinite(num)) {
        return num;
      }
    }
    throw new Error(
      `Invalid value for transformation property, expected number or numeric string, got ${JSON.stringify(value)}`
    );
  }
}

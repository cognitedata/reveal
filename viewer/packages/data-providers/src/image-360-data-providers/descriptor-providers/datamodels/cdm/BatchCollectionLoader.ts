/*!
 * Copyright 2025 Cognite AS
 */

import { CogniteClient, DirectRelationReference, FileInfo } from '@cognite/sdk';
import { DataModelsSdk } from '../../../../DataModelsSdk';
import { get360BatchCollectionQuery } from './get360CdmCollectionsQuery';
import type {
  Historical360ImageSet,
  Image360Descriptor,
  Image360FileDescriptor,
  Image360RevisionId
} from '../../../../types';
import type { DMDataSourceType } from '../../../../DataSourceType';
import chunk from 'lodash/chunk';
import zip from 'lodash/zip';
import groupBy from 'lodash/groupBy';
import partition from 'lodash/partition';
import { DMInstanceRef } from '@reveal/utilities';
import { Euler, Matrix4 } from 'three';
import type { ImageInstanceResult, ImageResultProperties, CollectionInstanceResult, CoreDmFileResponse } from './types';
import { BATCH_SIZE, BATCH_DELAY_MS } from '../../../../utilities/constants';

type BatchQueryResult = {
  image_collections: CollectionInstanceResult[];
  images: ImageInstanceResult[];
  stations?: Array<{ externalId: string; space: string }>;
  nextCursor?: Record<string, string>;
};

interface FileInfoWithInstanceId extends FileInfo {
  instanceId?: DirectRelationReference;
}

// Note: DMS properties are returned as string | number | DMInstanceRef (which is DirectRelationReference)
// We need to handle this flexibility and convert to the correct types when needed
type DmsPropertyValue = string | number | DMInstanceRef;

/**
 * Coordinates batched loading of multiple 360 image collections.
 * Instead of loading each collection individually (1000 queries for 1000 collections),
 * it batches them into groups and makes far fewer queries (e.g., 20 queries for 1000 collections).
 *
 * Note: DMS API has a limit of 10,000 items per query. With a batch size of 50 collections,
 * this allows ~200 images per collection on average. If your collections have more images,
 * consider reducing the batch size.
 */
export class BatchCollectionLoader {
  private readonly _dmsSdk: DataModelsSdk;
  private readonly _cogniteSdk: CogniteClient;
  private readonly _batchSize: number;
  private _pendingBatch: Array<{
    identifier: { externalId: string; space: string };
    resolve: (descriptors: Historical360ImageSet<DMDataSourceType>[]) => void;
    reject: (error: unknown) => void;
  }> = [];
  private _batchTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly _batchDelay: number;
  private _isProcessing = false; // Flag to ensure sequential batch execution

  constructor(dmsSdk: DataModelsSdk, cogniteSdk: CogniteClient) {
    this._dmsSdk = dmsSdk;
    this._cogniteSdk = cogniteSdk;
    this._batchSize = BATCH_SIZE;
    this._batchDelay = BATCH_DELAY_MS;
  }

  /**
   * Request descriptors for a collection. This will be batched with other concurrent requests.
   * Batches are processed sequentially to avoid overwhelming the API.
   */
  public async getCollectionDescriptors(identifier: {
    externalId: string;
    space: string;
  }): Promise<Historical360ImageSet<DMDataSourceType>[]> {
    return new Promise((resolve, reject) => {
      this._pendingBatch.push({ identifier, resolve, reject });

      // Clear existing timer
      if (this._batchTimer) {
        clearTimeout(this._batchTimer);
      }

      // If we've hit the batch size, execute immediately (if not already processing)
      if (this._pendingBatch.length >= this._batchSize) {
        void this.tryExecuteBatch();
      } else {
        // Otherwise, wait a bit to accumulate more requests
        this._batchTimer = setTimeout(() => {
          void this.tryExecuteBatch();
        }, this._batchDelay);
      }
    });
  }

  /**
   * Try to execute a batch. If already processing, this will be a no-op.
   * The next batch will be picked up when the current one finishes.
   */
  private async tryExecuteBatch(): Promise<void> {
    if (this._isProcessing || this._pendingBatch.length === 0) {
      return;
    }

    this._isProcessing = true;
    try {
      await this.executeBatch();
    } finally {
      this._isProcessing = false;

      // If there are more pending requests, process the next batch
      if (this._pendingBatch.length > 0) {
        // Small delay before next batch to avoid rapid-fire requests
        setTimeout(() => {
          void this.tryExecuteBatch();
        }, 50);
      }
    }
  }

  private async executeBatch(): Promise<void> {
    if (this._pendingBatch.length === 0) return;

    // Take current batch and reset for next batch
    const batch = this._pendingBatch;
    this._pendingBatch = [];
    this._batchTimer = null;

    const collectionRefs = batch.map(item => item.identifier);

    try {
      // Execute batch query directly - no throttling needed
      // The batching itself (10 queries instead of 1000) prevents API overload
      const query = get360BatchCollectionQuery(collectionRefs);

      const result = await this._dmsSdk.queryNodesAndEdges(query);

      // Group results by collection
      const resultsByCollection = await this.groupResultsByCollection(result);

      // Resolve each request with its specific results
      batch.forEach(({ identifier, resolve }) => {
        const key = `${identifier.externalId}:${identifier.space}`;
        const descriptors = resultsByCollection.get(key);

        if (descriptors) {
          resolve(descriptors);
        } else {
          // Collection not found
          console.warn(`Collection not found: ${key}`);
          resolve([]);
        }
      });
    } catch (error) {
      // If batch query fails, reject all requests
      console.error('Batch query failed:', error);
      batch.forEach(({ reject }) => reject(error));
    }
  }

  private async groupResultsByCollection(
    result: BatchQueryResult
  ): Promise<Map<string, Historical360ImageSet<DMDataSourceType>[]>> {
    const grouped = new Map<string, Historical360ImageSet<DMDataSourceType>[]>();

    if (!result.image_collections || !result.images) {
      console.warn('Missing image_collections or images in result:', {
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
      if (collectionRef && typeof collectionRef === 'object' && 'externalId' in collectionRef) {
        const key = `${collectionRef.externalId}:${collectionRef.space}`;
        if (!imagesByCollection.has(key)) {
          imagesByCollection.set(key, []);
        }
        imagesByCollection.get(key)!.push(image);
      }
    });

    // Process each collection
    result.image_collections.forEach(collection => {
      const collectionKey = `${collection.externalId}:${collection.space}`;
      const collectionImages = imagesByCollection.get(collectionKey) || [];

      if (collectionImages.length === 0) {
        grouped.set(collectionKey, []);
        return;
      }

      const collectionId = collection.externalId;
      const name = collection.properties?.cdf_cdm?.['Cognite360ImageCollection/v1']?.name;
      const collectionLabel = typeof name === 'string' ? name : typeof name === 'number' ? String(name) : undefined;

      // Get file descriptors for this collection's images
      const fileDescriptorsForCollection = this.getFileDescriptorsForImages(collectionImages, allFileDescriptors);

      // Create Historical360ImageSet
      const historicalSets = this.createHistoricalImageSets(
        collectionId,
        collectionLabel ?? collectionId,
        collectionImages,
        fileDescriptorsForCollection
      );

      grouped.set(collectionKey, historicalSets);
    });

    return grouped;
  }

  private async getFileDescriptorsForBatch(images: ImageInstanceResult[]): Promise<Map<string, FileInfo>> {
    const imageProps = images.map(image => image.properties.cdf_cdm['Cognite360Image/v1']);
    const cubeMapFileIds = imageProps.flatMap(imageProp => {
      const faces = [imageProp.front, imageProp.back, imageProp.left, imageProp.right, imageProp.top, imageProp.bottom];
      return faces.filter((face): face is DirectRelationReference => typeof face === 'object' && 'externalId' in face);
    });

    // Batch file requests - reduce to 100 per batch to avoid timeout
    // The /files/byids endpoint seems to have performance issues with large batches
    const batches = chunk(cubeMapFileIds, BATCH_SIZE);

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
        const key = `${instanceId.externalId}:${instanceId.space}`;
        fileMap.set(key, file);
      } else {
        console.warn(`File ${file.id} missing instanceId in response`);
      }
    });

    return fileMap;
  }

  private getFileDescriptorsForImages(images: ImageInstanceResult[], fileMap: Map<string, FileInfo>): FileInfo[][] {
    return images.map(image => {
      const props = image.properties.cdf_cdm['Cognite360Image/v1'];
      const faces = [props.front, props.back, props.left, props.right, props.top, props.bottom];

      const faceFiles = faces
        .filter((face): face is DirectRelationReference => typeof face === 'object' && 'externalId' in face)
        .map(ref => {
          // Create the same key format used in the file map
          const key = `${ref.externalId}:${ref.space}`;
          return fileMap.get(key);
        })
        .filter((f): f is FileInfo => f !== undefined);

      return faceFiles;
    });
  }

  private createHistoricalImageSets(
    collectionId: string,
    collectionLabel: string,
    images: ImageInstanceResult[],
    fileDescriptors: FileInfo[][]
  ): Historical360ImageSet<DMDataSourceType>[] {
    const imagesGroupedWithFileDescriptors = zip(images, fileDescriptors)
      .filter(
        (pair): pair is [ImageInstanceResult, FileInfo[]] =>
          pair[0] !== undefined && pair[1] !== undefined && pair[1].length === 6
      )
      .map(([image, fileDescriptors]) => ({ image, fileDescriptors }));

    const [imagesWithoutStation, imagesWithStation] = partition(imagesGroupedWithFileDescriptors, image => {
      const station = image.image.properties.cdf_cdm['Cognite360Image/v1'].station360;
      return !(typeof station === 'object' && 'externalId' in station);
    });

    const groups = groupBy(imagesWithStation, imageResult => {
      const station = imageResult.image.properties.cdf_cdm['Cognite360Image/v1'].station360;
      if (station && typeof station === 'object' && 'externalId' in station) {
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
      { fileId: fileInfos[4].id, face: 'top', mimeType: fileInfos[5].mimeType! },
      { fileId: fileInfos[5].id, face: 'bottom', mimeType: fileInfos[5].mimeType! }
    ] as Image360FileDescriptor[];
  }

  private getRevisionTransform(revision: ImageResultProperties): Matrix4 {
    // Convert DmsPropertyValue to number
    const toNumber = (value: DmsPropertyValue): number => {
      return typeof value === 'number' ? value : parseFloat(String(value));
    };

    const [x, y, z] = [
      toNumber(revision.translationX),
      toNumber(revision.translationY),
      toNumber(revision.translationZ)
    ];
    const translation = new Matrix4().makeTranslation(x, z, -y);

    const [rx, ry, rz] = [
      toNumber(revision.eulerRotationX),
      toNumber(revision.eulerRotationY),
      toNumber(revision.eulerRotationZ)
    ];
    const eulerRotation = new Euler(rx, rz, -ry, 'XYZ');
    const rotation = new Matrix4().makeRotationFromEuler(eulerRotation);

    return translation.multiply(rotation);
  }

  private async getCdmFiles(identifiers: DirectRelationReference[]): Promise<FileInfo[]> {
    const url = `${this._cogniteSdk.getBaseUrl()}/api/v1/projects/${this._cogniteSdk.project}/files/byids`;

    try {
      const res = (await this._cogniteSdk.post(url, {
        data: { items: identifiers.map(id => ({ instanceId: id })) }
      })) as CoreDmFileResponse;

      return res.data.items;
    } catch (error: unknown) {
      console.error(`CDM files API error:`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch CDM files: ${message}`);
    }
  }
}

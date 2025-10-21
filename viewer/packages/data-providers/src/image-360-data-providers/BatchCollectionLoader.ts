/*!
 * Copyright 2025 Cognite AS
 */

import { CogniteClient, DirectRelationReference, FileInfo } from '@cognite/sdk';
import { DataModelsSdk } from '../DataModelsSdk';
import { get360BatchCollectionQuery } from './descriptor-providers/datamodels/cdm/get360CdmBatchCollectionQuery';
import type { Historical360ImageSet, Image360Descriptor, Image360FileDescriptor, Image360RevisionId } from '../types';
import type { DMDataSourceType } from '../DataSourceType';
import chunk from 'lodash/chunk';
import zip from 'lodash/zip';
import groupBy from 'lodash/groupBy';
import partition from 'lodash/partition';
import { DMInstanceRef } from '@reveal/utilities';
import { Euler, Matrix4 } from 'three';

type ImageInstanceResult = any;
type ImageResultProperties = any;

type CoreDmFileResponse = {
  data: {
    items: FileInfo[];
  };
};

/**
 * Coordinates batched loading of multiple 360 image collections.
 * Instead of loading each collection individually (1000 queries for 1000 collections),
 * it batches them into groups and makes far fewer queries (e.g., 10 queries for 1000 collections).
 */
export class BatchCollectionLoader {
  private readonly _dmsSdk: DataModelsSdk;
  private readonly _cogniteSdk: CogniteClient;
  private readonly _batchSize: number;
  private _pendingBatch: Array<{
    identifier: { externalId: string; space: string };
    resolve: (descriptors: Historical360ImageSet<DMDataSourceType>[]) => void;
    reject: (error: any) => void;
  }> = [];
  private _batchTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly _batchDelayMs: number;

  constructor(
    dmsSdk: DataModelsSdk,
    cogniteSdk: CogniteClient,
    options?: { batchSize?: number; batchDelayMs?: number }
  ) {
    this._dmsSdk = dmsSdk;
    this._cogniteSdk = cogniteSdk;
    this._batchSize = options?.batchSize ?? 100; // Load up to 100 collections per query
    this._batchDelayMs = options?.batchDelayMs ?? 50; // Wait 50ms to accumulate requests
  }

  /**
   * Request descriptors for a collection. This will be batched with other concurrent requests.
   */
  public async getCollectionDescriptors(
    identifier: { externalId: string; space: string }
  ): Promise<Historical360ImageSet<DMDataSourceType>[]> {
    return new Promise((resolve, reject) => {
      this._pendingBatch.push({ identifier, resolve, reject });

      // Clear existing timer
      if (this._batchTimer) {
        clearTimeout(this._batchTimer);
      }

      // If we've hit the batch size, execute immediately
      if (this._pendingBatch.length >= this._batchSize) {
        void this.executeBatch();
      } else {
        // Otherwise, wait a bit to accumulate more requests
        this._batchTimer = setTimeout(() => {
          void this.executeBatch();
        }, this._batchDelayMs);
      }
    });
  }

  private async executeBatch(): Promise<void> {
    if (this._pendingBatch.length === 0) return;

    // Take current batch and reset for next batch
    const batch = this._pendingBatch;
    this._pendingBatch = [];
    this._batchTimer = null;

    const collectionRefs = batch.map(item => item.identifier);

    try {
      console.log(`🚀 Batching ${batch.length} collection queries into 1 DMS query`);

      // Execute batch query directly - no throttling needed
      // The batching itself (10 queries instead of 1000) prevents API overload
      const query = get360BatchCollectionQuery(collectionRefs);
      const result = await this._dmsSdk.queryNodesAndEdges(query);

      // Group results by collection
      const resultsByCollection = await this.groupResultsByCollection(result, collectionRefs);

      // Resolve each request with its specific results
      batch.forEach(({ identifier, resolve }) => {
        const key = `${identifier.externalId}:${identifier.space}`;
        const descriptors = resultsByCollection.get(key);

        if (descriptors) {
          resolve(descriptors);
        } else {
          // Collection not found
          resolve([]);
        }
      });
    } catch (error) {
      // If batch query fails, reject all requests
      batch.forEach(({ reject }) => reject(error));
    }
  }

  private async groupResultsByCollection(
    result: any,
    collectionRefs: Array<{ externalId: string; space: string }>
  ): Promise<Map<string, Historical360ImageSet<DMDataSourceType>[]>> {
    const grouped = new Map<string, Historical360ImageSet<DMDataSourceType>[]>();

    if (!result.image_collections || !result.images) {
      return grouped;
    }

    // Get file descriptors for all images in batch
    const allFileDescriptors = await this.getFileDescriptorsForBatch(result.images);

    // Group images by their collection
    const imagesByCollection = new Map<string, ImageInstanceResult[]>();

    result.images.forEach((image: ImageInstanceResult, index: number) => {
      const collectionRef = image.properties?.cdf_cdm?.['Cognite360Image/v1']?.collection360;
      if (collectionRef) {
        const key = `${collectionRef.externalId}:${collectionRef.space}`;
        if (!imagesByCollection.has(key)) {
          imagesByCollection.set(key, []);
        }
        imagesByCollection.get(key)!.push(image);
      }
    });

    // Process each collection
    result.image_collections.forEach((collection: any) => {
      const collectionKey = `${collection.externalId}:${collection.space}`;
      const collectionImages = imagesByCollection.get(collectionKey) || [];

      if (collectionImages.length === 0) {
        grouped.set(collectionKey, []);
        return;
      }

      const collectionId = collection.externalId;
      const collectionLabel = collection.properties?.cdf_cdm?.['Cognite360ImageCollection/v1']?.name as string;

      // Get file descriptors for this collection's images
      const fileDescriptorsForCollection = this.getFileDescriptorsForImages(
        collectionImages,
        allFileDescriptors
      );

      // Create Historical360ImageSet
      const historicalSets = this.createHistoricalImageSets(
        collectionId,
        collectionLabel,
        collectionImages,
        fileDescriptorsForCollection
      );

      grouped.set(collectionKey, historicalSets);
    });

    return grouped;
  }

  private async getFileDescriptorsForBatch(images: ImageInstanceResult[]): Promise<Map<string, FileInfo>> {
    const imageProps = images.map(image => image.properties.cdf_cdm['Cognite360Image/v1']);
    const cubeMapFileIds = imageProps.flatMap(imageProp => [
      imageProp.front as DirectRelationReference,
      imageProp.back as DirectRelationReference,
      imageProp.left as DirectRelationReference,
      imageProp.right as DirectRelationReference,
      imageProp.top as DirectRelationReference,
      imageProp.bottom as DirectRelationReference
    ]);

    // Batch file requests - 1000 per batch as per CDF API limits
    const batchSize = 1000;
    const batches = chunk(cubeMapFileIds, batchSize);

    const fileInfos: FileInfo[] = [];

    // Process batches sequentially
    for (const batch of batches) {
      const batchFileInfos = await this.getCdmFiles(batch);
      fileInfos.push(...batchFileInfos);
    }

    // Create map for quick lookup
    const fileMap = new Map<string, FileInfo>();
    fileInfos.forEach(file => {
      const key = `${file.externalId}:${(file as any).space || 'cdf_cdm'}`;
      fileMap.set(key, file);
    });

    return fileMap;
  }

  private getFileDescriptorsForImages(
    images: ImageInstanceResult[],
    fileMap: Map<string, FileInfo>
  ): FileInfo[][] {
    return images.map(image => {
      const props = image.properties.cdf_cdm['Cognite360Image/v1'];
      const faces = [props.front, props.back, props.left, props.right, props.top, props.bottom];

      return faces.map(face => {
        const key = `${(face as DirectRelationReference).externalId}:${(face as DirectRelationReference).space}`;
        return fileMap.get(key)!;
      }).filter(f => f !== undefined);
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
      return image.image.properties.cdf_cdm['Cognite360Image/v1'].station360 === undefined;
    });

    const groups = groupBy(imagesWithStation, imageResult => {
      const station = imageResult.image.properties.cdf_cdm['Cognite360Image/v1'].station360 as DMInstanceRef;
      return `${station.externalId}-${station.space}`;
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
      transform: this.getRevisionTransform(mainImagePropsArray[0] as any)
    };
  }

  private getImageRevision(
    revisionId: Image360RevisionId<DMDataSourceType>,
    imageProps: ImageResultProperties,
    fileInfos: FileInfo[]
  ): Image360Descriptor<DMDataSourceType> {
    return {
      id: revisionId,
      faceDescriptors: this.getFaceDescriptors(fileInfos),
      timestamp: imageProps.takenAt as string
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

  private getRevisionTransform(revision: {
    translationX: number;
    translationY: number;
    translationZ: number;
    eulerRotationX: number;
    eulerRotationY: number;
    eulerRotationZ: number;
  }): Matrix4 {
    const [x, y, z] = [revision.translationX, revision.translationY, revision.translationZ];
    const translation = new Matrix4().makeTranslation(x, z, -y);

    const [rx, ry, rz] = [revision.eulerRotationX, revision.eulerRotationY, revision.eulerRotationZ];
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
    } catch (error: any) {
      throw new Error(`Failed to fetch CDM files: ${error.message || error}`);
    }
  }
}


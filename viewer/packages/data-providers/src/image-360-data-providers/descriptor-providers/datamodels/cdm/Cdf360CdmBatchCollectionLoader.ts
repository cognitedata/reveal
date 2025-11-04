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
 * This allows collections with any number of images, not just ~200 per collection (10,000 / 50 batch size).
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

  public async getCollectionDescriptors(identifier: DMInstanceRef): Promise<Historical360ImageSet<DMDataSourceType>[]> {
    return this.load(identifier);
  }

  protected async fetchBatch(
    identifiers: DMInstanceRef[]
  ): Promise<Map<string, Historical360ImageSet<DMDataSourceType>[]>> {
    // Execute batch query directly
    // The batching itself (BATCH_SIZE queries instead of 1000) prevents API overload
    const query = get360CdmCollectionsQuery(identifiers);

    const allResults = await this.fetchAllPages(query);

    return this.groupResultsByCollection(allResults);
  }

  protected getKeyForIdentifier(identifier: DMInstanceRef): string {
    return dmInstanceRefToKey(identifier);
  }

  protected getDefaultResult(_identifier: DMInstanceRef): Historical360ImageSet<DMDataSourceType>[] {
    console.warn(`[${Cdf360CdmBatchCollectionLoader.name}] Collection not found: ${dmInstanceRefToKey(_identifier)}`);
    return [];
  }

  private async fetchAllPages(query: CdfImage360CollectionDmQuery): Promise<BatchQueryResult> {
    let imagesCursor: string | undefined;
    const accumulatedResults: BatchQueryResult = {
      image_collections: [],
      images: [],
      stations: []
    };

    const imagesLimit = 10000; // Must match the limit in get360CdmCollectionsQuery

    do {
      // Only pass the images cursor for pagination
      const cursors = imagesCursor ? { images: imagesCursor } : undefined;
      const result = await this._dmsSdk.queryNodesAndEdges<CdfImage360CollectionDmQuery>(query, cursors);

      if (!result) {
        break;
      }

      // Accumulate image_collections (only on first page, subsequent pages won't have them)
      if (result.image_collections && result.image_collections.length > 0) {
        accumulatedResults.image_collections = [...accumulatedResults.image_collections, ...result.image_collections];
      }

      // Accumulate images
      if (result.images && result.images.length > 0) {
        accumulatedResults.images = [...accumulatedResults.images, ...result.images];
      }

      // Accumulate stations (only relevant when images are fetched)
      if (result.stations && result.stations.length > 0) {
        accumulatedResults.stations = [...(accumulatedResults.stations || []), ...result.stations];
      }

      // Only continue pagination if we got a full page of images (meaning there might be more)
      const hasMoreImages = result.images && result.images.length >= imagesLimit;
      imagesCursor = result.nextCursor?.images;

      if (!hasMoreImages || !imagesCursor) {
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

    const allFileDescriptors = await this.getFileDescriptorsForBatch(result.images);

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

    result.image_collections.forEach(collection => {
      const collectionKey = dmInstanceRefToKey(collection);
      const collectionImages = imagesByCollection.get(collectionKey) ?? [];

      if (collectionImages.length === 0) {
        grouped.set(collectionKey, []);
        return;
      }

      const collectionId = collection.externalId;
      const name = collection.properties?.cdf_cdm?.['Cognite360ImageCollection/v1']?.name;
      const collectionLabel = this.stringifyValue(name);

      const imagesWithFiles = this.getFileDescriptorsForImages(collectionImages, allFileDescriptors);

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

    const fileMap = new Map<string, FileInfo>();

    fileInfos.forEach(file => {
      const fileWithInstanceId = file as FileInfoWithInstanceId;
      const instanceId = fileWithInstanceId.instanceId;

      if (instanceId) {
        const key = dmInstanceRefToKey(instanceId);
        fileMap.set(key, file);
      } else {
        console.warn(`[${Cdf360CdmBatchCollectionLoader.name}] File ${file.id} missing instanceId in response`);
      }
    });

    return fileMap;
  }

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
      timestamp: this.stringifyValue(timestamp)
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

  private stringifyValue(value: RawPropertyValueV3): string | undefined {
    return typeof value === 'string' ? value : typeof value === 'number' ? String(value) : undefined;
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

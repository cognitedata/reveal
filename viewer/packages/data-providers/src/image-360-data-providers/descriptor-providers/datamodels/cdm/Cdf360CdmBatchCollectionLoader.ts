/*!
 * Copyright 2025 Cognite AS
 */

import { CogniteClient, RawPropertyValueV3 } from '@cognite/sdk';
import { DataModelsSdk } from '../../../../DataModelsSdk';
import { get360CdmCollectionsQuery, CdfImage360CollectionDmQuery } from './get360CdmCollectionsQuery';
import type {
  Historical360ImageSet,
  Image360Descriptor,
  Image360FileDescriptor,
  Image360RevisionId
} from '../../../../types';
import type { DMDataSourceType } from '../../../../DataSourceType';
import groupBy from 'lodash/groupBy';
import partition from 'lodash/partition';
import { Euler, Matrix4 } from 'three';
import { DEFAULT_360_IMAGE_MIME_TYPE, MAX_DMS_QUERY_LIMIT } from '../../../../utilities/constants';
import { DMInstanceKey, DMInstanceRef, dmInstanceRefToKey, isDmIdentifier } from '@reveal/utilities';
import { BatchLoader } from '../../../../utilities/BatchLoader';
import { getDmsPaginationCursor } from '../../../../utilities/dmsPaginationUtils';

// DMS query result type - using batch query structure
type QueryResult = Awaited<ReturnType<typeof DataModelsSdk.prototype.queryNodesAndEdges<CdfImage360CollectionDmQuery>>>;

type ImageInstanceResult = QueryResult['images'][number];
type ImageResultProperties = ImageInstanceResult['properties']['cdf_cdm']['Cognite360Image/v1'];

// Collection types - batch query uses 'image_collections' (plural)
type CollectionInstanceResult = QueryResult['image_collections'][number];

type BatchQueryResult = {
  image_collections: CollectionInstanceResult[];
  images: ImageInstanceResult[];
  stations: DMInstanceRef[];
  nextCursor?: Record<string, string>;
};

/** Face property names in the Cognite360Image schema */
type FaceName = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 50;

/**
 * Coordinates batched loading of multiple 360 image collections.
 * Instead of loading each collection individually (1000 queries for 1000 collections),
 * it batches them into groups and makes far fewer queries (e.g., 20 queries for 1000 collections).
 * This allows collections with any number of images, not just ~200 per collection (10,000 / 50 batch size).
 *
 * This loader uses instance IDs directly from DMS queries to identify files,
 * eliminating the need for /files/byids API calls to resolve file metadata.
 * This significantly improves loading performance for large collections (e.g., 16k+ images).
 */
export class Cdf360CdmBatchCollectionLoader extends BatchLoader<
  DMInstanceRef,
  Historical360ImageSet<DMDataSourceType>[]
> {
  private readonly _dmsSdk: DataModelsSdk;

  constructor(dmsSdk: DataModelsSdk, _cogniteSdk: CogniteClient) {
    super(BATCH_SIZE, BATCH_DELAY_MS);
    this._dmsSdk = dmsSdk;
    // Note: cogniteSdk is no longer needed - we use instance IDs directly
    // Kept in signature for backwards compatibility
  }

  public async getCollectionDescriptors(identifier: DMInstanceRef): Promise<Historical360ImageSet<DMDataSourceType>[]> {
    return this.load(identifier);
  }

  protected async fetchBatch(
    identifiers: DMInstanceRef[]
  ): Promise<Map<DMInstanceKey, Historical360ImageSet<DMDataSourceType>[]>> {
    // Execute batch query directly
    // The batching itself (BATCH_SIZE queries instead of 1000) prevents API overload
    const query = get360CdmCollectionsQuery(identifiers);

    const allResults = await this.fetchAllPages(query);

    return this.groupResultsByCollection(allResults);
  }

  protected getKeyForIdentifier(identifier: DMInstanceRef): DMInstanceKey {
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

    do {
      // Only pass the images cursor for pagination
      const cursors = imagesCursor ? { images: imagesCursor } : undefined;
      const result = await this._dmsSdk.queryNodesAndEdges<CdfImage360CollectionDmQuery>(query, cursors);

      if (!result) {
        break;
      }

      if (result.image_collections && result.image_collections.length > 0) {
        accumulatedResults.image_collections = [...accumulatedResults.image_collections, ...result.image_collections];
      }

      if (result.images && result.images.length > 0) {
        accumulatedResults.images = [...accumulatedResults.images, ...result.images];
      }

      if (result.stations && result.stations.length > 0) {
        accumulatedResults.stations = [...(accumulatedResults.stations || []), ...result.stations];
      }

      // Check if we should continue pagination for images
      imagesCursor = getDmsPaginationCursor(result.images, result.nextCursor, 'images', MAX_DMS_QUERY_LIMIT);

      if (!imagesCursor) {
        break;
      }
    } while (true);

    return accumulatedResults;
  }

  private async groupResultsByCollection(
    result: BatchQueryResult
  ): Promise<Map<DMInstanceKey, Historical360ImageSet<DMDataSourceType>[]>> {
    const grouped = new Map<DMInstanceKey, Historical360ImageSet<DMDataSourceType>[]>();

    if (!result.image_collections || !result.images) {
      console.warn(`[${Cdf360CdmBatchCollectionLoader.name}] Missing image_collections or images in result:`, {
        hasCollections: !!result.image_collections,
        hasImages: !!result.images
      });
      return grouped;
    }

    const imagesByCollection = new Map<DMInstanceKey, ImageInstanceResult[]>();

    result.images.forEach(image => {
      const collectionRef = image.properties?.cdf_cdm?.['Cognite360Image/v1']?.collection360;
      if (!isDmIdentifier(collectionRef)) {
        return;
      }

      const key = dmInstanceRefToKey(collectionRef);
      if (!imagesByCollection.has(key)) {
        imagesByCollection.set(key, []);
      }
      imagesByCollection.get(key)?.push(image);
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

      // Create file descriptors directly from images using instance IDs
      // This eliminates the need for /files/byids API calls (~100+ requests for large collections)
      const imagesWithFiles = collectionImages.map(image => ({
        image,
        fileDescriptors: this.createFileDescriptorsFromImage(image)
      }));

      const historicalSets = this.createHistoricalImageSets(
        collectionId,
        collectionLabel ?? collectionId,
        imagesWithFiles
      );

      grouped.set(collectionKey, historicalSets);
    });

    return grouped;
  }

  /**
   * Creates file descriptors directly from the DMS image data using instance IDs.
   * This avoids the need to call /files/byids to resolve file metadata.
   * The instance IDs are used directly with the /files/downloadlink endpoint.
   */
  private createFileDescriptorsFromImage(image: ImageInstanceResult): Image360FileDescriptor[] {
    const props = image.properties.cdf_cdm['Cognite360Image/v1'];
    const faces: Array<{ prop: unknown; face: FaceName }> = [
      { prop: props.front, face: 'front' },
      { prop: props.back, face: 'back' },
      { prop: props.left, face: 'left' },
      { prop: props.right, face: 'right' },
      { prop: props.top, face: 'top' },
      { prop: props.bottom, face: 'bottom' }
    ];

    return faces
      .filter(({ prop }) => isDmIdentifier(prop))
      .map(({ prop, face }) => ({
        instanceId: prop as DMInstanceRef,
        face,
        mimeType: DEFAULT_360_IMAGE_MIME_TYPE
      }));
  }

  private createHistoricalImageSets(
    collectionId: string,
    collectionLabel: string,
    imagesWithFiles: Array<{ image: ImageInstanceResult; fileDescriptors: Image360FileDescriptor[] }>
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
        return dmInstanceRefToKey(station);
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
    imageFileDescriptors: { image: ImageInstanceResult; fileDescriptors: Image360FileDescriptor[] }[]
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
    fileDescriptors: Image360FileDescriptor[]
  ): Image360Descriptor<DMDataSourceType> {
    const timestamp = imageProps.takenAt;
    return {
      id: revisionId,
      faceDescriptors: fileDescriptors,
      timestamp: this.stringifyValue(timestamp)
    };
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

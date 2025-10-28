/*!
 * Copyright 2025 Cognite AS
 */

import { CogniteClient, CogniteEvent, EventFilter, FileFilterProps, FileInfo, Metadata } from '@cognite/sdk';
import type { Historical360ImageSet, Image360RevisionDescriptor, Image360FileDescriptor } from '../../../types';
import uniqBy from 'lodash/uniqBy';
import range from 'lodash/range';
import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import { MathUtils, Matrix4, Vector3 } from 'three';
import { ClassicDataSourceType } from '../../../DataSourceType';
import { BATCH_DELAY_MS, BATCH_SIZE } from '../../../utilities/constants';

type Event360Metadata = Event360Filter & Event360TransformationData;

type Event360TransformationData = {
  rotation_angle: string;
  rotation_axis: string;
  translation: string;
};

type Event360Filter = {
  site_id: string;
  site_name?: string;
  station_id: string;
  station_name?: string;
};

/**
 * Coordinates batched loading of multiple events-based 360 image collections.
 * Instead of querying events/files individually per site_id (1000 queries for 1000 sites),
 * it batches them into groups (e.g., 20 queries for 1000 sites).
 */
export class BatchEventCollectionLoader {
  private readonly _client: CogniteClient;
  private readonly _batchSize: number;
  private _pendingBatch: Array<{
    siteId: string;
    preMultipliedRotation: boolean;
    resolve: (descriptors: Historical360ImageSet<ClassicDataSourceType>[]) => void;
    reject: (error: unknown) => void;
  }> = [];
  private _batchTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly _batchDelay: number;
  private _isProcessing = false; // Flag to ensure sequential batch execution

  constructor(client: CogniteClient) {
    this._client = client;
    this._batchSize = BATCH_SIZE;
    this._batchDelay = BATCH_DELAY_MS;
  }

  /**
   * Request descriptors for an events-based collection. This will be batched with other concurrent requests.
   * Batches are processed sequentially to avoid overwhelming the API.
   */
  public async getCollectionDescriptors(
    metadataFilter: Metadata,
    preMultipliedRotation: boolean
  ): Promise<Historical360ImageSet<ClassicDataSourceType>[]> {
    const siteId = metadataFilter.site_id as string;
    if (!siteId) {
      throw new Error('site_id is required for events-based 360 collections');
    }

    return new Promise((resolve, reject) => {
      this._pendingBatch.push({ siteId, preMultipliedRotation, resolve, reject });

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

    const siteIds = batch.map(item => item.siteId);
    const uniqueSiteIds = Array.from(new Set(siteIds));

    try {
      // Fetch events and files for all site_ids in one request
      const [events, files] = await Promise.all([
        this.listEventsForMultipleSites(uniqueSiteIds),
        this.listFilesForMultipleSites(uniqueSiteIds)
      ]);

      // Group events and files by site_id
      const eventsBySiteId = this.groupEventsBySiteId(events);
      const filesBySiteId = files;

      // Resolve each request with its specific results
      batch.forEach(({ siteId, preMultipliedRotation, resolve }) => {
        const siteEvents = eventsBySiteId.get(siteId) || [];
        const siteFiles = filesBySiteId.get(siteId) || new Map();

        const descriptors = this.mergeDescriptors(siteFiles, siteEvents, preMultipliedRotation);

        if (descriptors.length === 0) {
          // Empty result, not an error
          resolve([]);
        } else {
          resolve(descriptors);
        }
      });
    } catch (error) {
      // If batch query fails, reject all requests
      batch.forEach(({ reject }) => reject(error));
    }
  }

  private async listEventsForMultipleSites(siteIds: string[]): Promise<CogniteEvent[]> {
    // Create OR filter for multiple site_ids
    const filter: EventFilter = {
      metadata: {
        site_id: siteIds // CDF Events API supports array for OR matching
      } as unknown as Metadata
    };

    const partitions = 10;
    const partitionedRequests = range(1, partitions + 1).map(async index =>
      this._client.events
        .list({ filter, limit: 1000, partition: `${index}/${partitions}` })
        .autoPagingToArray({ limit: Infinity })
    );

    const results = await Promise.all(partitionedRequests);
    return results.flat();
  }

  private async listFilesForMultipleSites(siteIds: string[]): Promise<Map<string, Map<string, FileInfo[]>>> {
    const mainMap = new Map<string, Map<string, FileInfo[]>>();

    // Initialize maps for each site_id
    siteIds.forEach(siteId => {
      mainMap.set(siteId, new Map<string, FileInfo[]>());
    });

    // Create OR filter for multiple site_ids
    const filter: FileFilterProps = {
      metadata: {
        site_id: siteIds // CDF Files API supports array for OR matching
      } as unknown as Metadata,
      uploaded: true
    };

    const partitions = 10;
    const partitionedRequests = range(1, partitions + 1).map(async index => {
      const req = { filter, limit: 1000, partition: `${index}/${partitions}` };
      return this._client.files.list(req).autoPagingEach(fileInfo => {
        const siteId = fileInfo.metadata?.site_id as string;
        const stationId = fileInfo.metadata?.station_id as string;
        if (!siteId || !stationId) return undefined;

        const siteMap = mainMap.get(siteId);
        if (siteMap) {
          const existingFiles = siteMap.get(stationId);
          if (existingFiles) {
            existingFiles.push(fileInfo);
          } else {
            siteMap.set(stationId, [fileInfo]);
          }
        }
        return undefined;
      });
    });

    await Promise.all(partitionedRequests);
    return mainMap;
  }

  private groupEventsBySiteId(events: CogniteEvent[]): Map<string, CogniteEvent[]> {
    const grouped = new Map<string, CogniteEvent[]>();

    events.forEach(event => {
      const siteId = event.metadata?.site_id as string;
      if (siteId) {
        if (!grouped.has(siteId)) {
          grouped.set(siteId, []);
        }
        grouped.get(siteId)!.push(event);
      }
    });

    return grouped;
  }

  private mergeDescriptors(
    files: Map<string, FileInfo[]>,
    events: CogniteEvent[],
    preMultipliedRotation: boolean
  ): Historical360ImageSet<ClassicDataSourceType>[] {
    const eventDescriptors = events
      .map(event => event.metadata)
      .filter((metadata): metadata is Event360Metadata => !!metadata)
      .map(metadata => this.parseEventMetadata(metadata, preMultipliedRotation));

    const uniqueEventDescriptors = uniqBy(eventDescriptors, eventDescriptor => eventDescriptor.id);

    return uniqueEventDescriptors
      .map(eventDescriptor => {
        const stationFileInfos = files.get(eventDescriptor.id);

        if (stationFileInfos === undefined || stationFileInfos.length < 6) {
          return { ...eventDescriptor, imageRevisions: [] };
        }

        const sortedFileInfoSet = this.sortFileInfoSetByNewest(stationFileInfos);

        const imageRevisions = sortedFileInfoSet
          .filter(imageSetInfo => imageSetInfo.length === 6)
          .map(imageSetInfo => {
            const timestamp = imageSetInfo[0].metadata?.timestamp;
            return {
              id: eventDescriptor.id,
              timestamp: timestamp ? Number(timestamp) : undefined,
              faceDescriptors: imageSetInfo.map(imageInfo => {
                return {
                  face: imageInfo.metadata!.face,
                  mimeType: imageInfo.mimeType!,
                  fileId: imageInfo.id
                } as Image360FileDescriptor;
              })
            };
          });
        return { ...eventDescriptor, imageRevisions };
      })
      .filter(historicalImages => historicalImages.imageRevisions.length > 0);
  }

  private sortFileInfoSetByNewest(fileInfos: FileInfo[]): FileInfo[][] {
    if (fileInfos[0].metadata?.timestamp !== undefined) {
      const sets = groupBy(fileInfos, fileInfo => fileInfo.metadata!.timestamp);
      return orderBy(Object.entries(sets), fileInfoEntry => parseInt(fileInfoEntry[0]), 'desc')
        .map(timeStampSets => timeStampSets[1])
        .filter(fileInfoSets => fileInfoSets.length === 6);
    }
    return [fileInfos];
  }

  private parseEventMetadata(
    eventMetadata: Event360Metadata,
    preMultipliedRotation: boolean
  ): Image360RevisionDescriptor<ClassicDataSourceType> {
    return {
      collectionId: eventMetadata.site_id,
      collectionLabel: eventMetadata.site_name ?? undefined,
      id: eventMetadata.station_id,
      label: eventMetadata.station_name ?? undefined,
      transform: this.parseTransform(eventMetadata, preMultipliedRotation)
    };
  }

  private parseTransform(transformationData: Event360TransformationData, preMultipliedRotation: boolean): Matrix4 {
    const translationComponents = transformationData.translation.split(',').map(parseFloat);
    const millimetersInMeters = 1000;
    const translation = new Vector3(
      translationComponents[0],
      translationComponents[2],
      -translationComponents[1]
    ).divideScalar(millimetersInMeters);

    const rotationAxisComponents = transformationData.rotation_axis.split(',').map(parseFloat);
    const rotationAxis = new Vector3(rotationAxisComponents[0], rotationAxisComponents[2], -rotationAxisComponents[1]);

    const rotationAngle = MathUtils.DEG2RAD * parseFloat(transformationData.rotation_angle);
    const rotationMatrix = new Matrix4().makeRotationAxis(rotationAxis, rotationAngle);

    const translationMatrix = new Matrix4().makeTranslation(translation.x, translation.y, translation.z);

    const entityTransform = translationMatrix.clone();
    if (!preMultipliedRotation) {
      entityTransform.multiply(rotationMatrix.clone().multiply(new Matrix4().makeRotationY(Math.PI / 2)));
    } else {
      entityTransform.multiply(new Matrix4().makeRotationY(Math.PI));
    }

    return entityTransform;
  }
}

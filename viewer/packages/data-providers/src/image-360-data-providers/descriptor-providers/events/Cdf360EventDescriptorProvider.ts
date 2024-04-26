/*!
 * Copyright 2023 Cognite AS
 */
import { CogniteClient, CogniteEvent, EventFilter, FileFilterProps, FileInfo, Metadata } from '@cognite/sdk';
import {
  Historical360ImageSet,
  Image360DescriptorProvider,
  Image360EventDescriptor,
  Image360FileDescriptor
} from '../../../types';
import { Log } from '@reveal/logger';
import uniqBy from 'lodash/uniqBy';
import range from 'lodash/range';
import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import { MathUtils, Matrix4, Vector3 } from 'three';

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

export class Cdf360EventDescriptorProvider implements Image360DescriptorProvider<Metadata> {
  private readonly _client: CogniteClient;
  constructor(client: CogniteClient) {
    this._client = client;
  }

  public async get360ImageDescriptors(
    metadataFilter: Metadata,
    preMultipliedRotation: boolean
  ): Promise<Historical360ImageSet[]> {
    const [events, files] = await Promise.all([
      this.listEvents({ metadata: metadataFilter }),
      this.listFiles({ metadata: metadataFilter, uploaded: true })
    ]);

    const image360Descriptors = this.mergeDescriptors(files, events, preMultipliedRotation);
    if (image360Descriptors.length === 0) {
      return Promise.reject(`Error: Could not find any 360 images to load for the site_id "${metadataFilter.site_id}"`);
    }

    if (events.length !== image360Descriptors.length) {
      Log.warn(
        `WARNING: There are ${events.length - image360Descriptors.length} rejected 360 images due to invalid data.`,
        '\nThis is typically due to duplicate events or missing files for the images of the cube map.'
      );
    }

    return image360Descriptors;
  }

  private mergeDescriptors(
    files: Map<string, FileInfo[]>,
    events: CogniteEvent[],
    preMultipliedRotation: boolean
  ): Historical360ImageSet[] {
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

  private async listEvents(filter: EventFilter): Promise<CogniteEvent[]> {
    const partitions = 10;
    const partitionedRequests = range(1, partitions + 1).flatMap(async index =>
      this._client.events
        .list({ filter, limit: 1000, partition: `${index}/${partitions}` })
        .autoPagingToArray({ limit: Infinity })
    );
    const result = await Promise.all(partitionedRequests);
    return result.flat();
  }

  private async listFiles(filter: FileFilterProps): Promise<Map<string, FileInfo[]>> {
    const map = new Map<string, FileInfo[]>();
    const partitions = 10;
    const partitionedRequest = range(1, partitions + 1).flatMap(async index => {
      const req = { filter, limit: 1000, partition: `${index}/${partitions}` };
      return this._client.files.list(req).autoPagingEach(fileInfo => {
        const id = fileInfo.metadata?.station_id;
        if (!id) return;
        addToMap(id, fileInfo);
      });
    });

    await Promise.all(partitionedRequest);
    return map;

    function addToMap(id: string, fileInfo: FileInfo) {
      const existingEntry = map.get(id);
      if (existingEntry) {
        existingEntry.push(fileInfo);
      } else {
        map.set(id, [fileInfo]);
      }
    }
  }

  private sortFileInfoSetByNewest(fileInfos: FileInfo[]): FileInfo[][] {
    if (hasTimestamp()) {
      return sortedByAge();
    }

    return [fileInfos];

    function hasTimestamp() {
      return fileInfos[0].metadata?.timestamp !== undefined;
    }

    function sortedByAge() {
      const sets = groupBy(fileInfos, fileInfo => fileInfo.metadata!.timestamp);

      const ordered = orderBy(Object.entries(sets), fileInfoEntry => parseInt(fileInfoEntry[0]), 'desc')
        .map(timeStampSets => timeStampSets[1])
        .filter(fileInfoSets => fileInfoSets.length === 6);
      return ordered;
    }
  }

  private parseEventMetadata(eventMetadata: Event360Metadata, preMultipliedRotation: boolean): Image360EventDescriptor {
    return {
      collectionId: eventMetadata.site_id,
      collectionLabel: eventMetadata.site_name,
      id: eventMetadata.station_id,
      label: eventMetadata.station_name,
      transform: parseTransform(eventMetadata)
    };

    function parseTransform(transformationData: Event360TransformationData): Matrix4 {
      const translationComponents = transformationData.translation.split(',').map(parseFloat);
      const millimetersInMeters = 1000;
      const translation = new Vector3(
        translationComponents[0],
        translationComponents[2],
        -translationComponents[1]
      ).divideScalar(millimetersInMeters);
      const rotationAxisComponents = transformationData.rotation_axis.split(',').map(parseFloat);
      const rotationAxis = new Vector3(
        rotationAxisComponents[0],
        rotationAxisComponents[2],
        -rotationAxisComponents[1]
      );
      const rotationAngle = MathUtils.DEG2RAD * parseFloat(transformationData.rotation_angle);
      const rotationMatrix = new Matrix4().makeRotationAxis(rotationAxis, rotationAngle);

      const translationMatrix = new Matrix4().makeTranslation(translation.x, translation.y, translation.z);

      return adjustPreMultipliedTransform(translationMatrix, rotationMatrix);
    }

    function adjustPreMultipliedTransform(translation: Matrix4, rotation: Matrix4): Matrix4 {
      const entityTransform = translation.clone();

      if (!preMultipliedRotation) {
        entityTransform.multiply(rotation.clone().multiply(new Matrix4().makeRotationY(Math.PI / 2)));
      } else {
        entityTransform.multiply(new Matrix4().makeRotationY(Math.PI));
      }

      return entityTransform;
    }
  }
}

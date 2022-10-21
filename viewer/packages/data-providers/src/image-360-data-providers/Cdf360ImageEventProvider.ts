/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import zipWith from 'lodash/zipWith';

import { CogniteClient, FileInfo, Metadata } from '@cognite/sdk';
import { Image360Descriptor, Image360Face } from '../types';
import { Image360Provider } from '../Image360Provider';
import assert from 'assert';

type Event360Metadata = Event360Filter & Event360TransformationData;

type Event360TransformationData = {
  rotation_angle: string;
  rotation_axis: string;
  translation: string;
};

type Event360Filter = {
  site_id: string;
  site_name: string;
  station_id: string;
  station_name: string;
};

export class Cdf360ImageEventProvider implements Image360Provider<Metadata> {
  private readonly _client: CogniteClient;
  constructor(client: CogniteClient) {
    this._client = client;
  }

  public async get360ImageDescriptors(metadataFilter: Metadata): Promise<Image360Descriptor[]> {
    const image360Events = await this._client.events.list({ filter: { metadata: metadataFilter } });
    return image360Events.items
      .map(image360Event => image360Event.metadata as Event360Metadata)
      .map(eventMetadata => this.parseEventMetadata(eventMetadata));
  }

  public async get360ImageFiles(image360Descriptor: Image360Descriptor): Promise<Image360Face[]> {
    const { collectionId, id } = image360Descriptor;
    const fileInfos = await this.getFileInfos(collectionId, id);
    const fileIds = fileInfos.map(fileInfo => {
      return { id: fileInfo.id };
    });
    const fileBuffers = await this.getFileBuffers(fileIds);

    const faces = zipWith(fileInfos, fileBuffers, (fileInfo, fileBuffer) => {
      return {
        face: fileInfo.metadata!.face,
        mimeType: fileInfo.mimeType,
        data: fileBuffer
      } as Image360Face;
    });

    return faces;
  }

  private async getFileInfos(siteId: string, stationId: string): Promise<FileInfo[]> {
    const fileInfos = await this._client.files.list({
      filter: {
        uploaded: true,
        metadata: {
          site_id: siteId,
          station_id: stationId,
          image_type: 'cubemap'
        }
      }
    });

    assert(fileInfos.items.length > 0);

    if (hasTimestamp()) {
      return getNewestTimestamp();
    }

    assert(fileInfos.items.length === 6);

    return fileInfos.items;

    function hasTimestamp() {
      return fileInfos.items[0].metadata?.timestamp !== undefined;
    }

    function getNewestTimestamp() {
      const sets = groupBy(fileInfos.items, fileInfo => fileInfo.metadata!.timestamp);
      const ordered = orderBy(Object.entries(sets), fileInfoEntry => parseInt(fileInfoEntry[0]), 'desc');
      assert(ordered[0][1].length === 6);
      return ordered[0][1];
    }
  }

  private async getFileBuffers(fileIds: { id: number }[]) {
    const fileLinks = await this._client.files.getDownloadUrls(fileIds);
    return Promise.all(
      fileLinks
        .map(fileLink => fetch(fileLink.downloadUrl, { method: 'GET' }))
        .map(async response => (await response).arrayBuffer())
    );
  }

  private parseEventMetadata(eventMetadata: Event360Metadata): Image360Descriptor {
    return {
      collectionId: eventMetadata.site_id,
      collectionLabel: eventMetadata.site_name,
      id: eventMetadata.station_id,
      label: eventMetadata.station_name,
      transformations: parseTransform(eventMetadata)
    };

    function parseTransform(transformationData: Event360TransformationData): {
      translation: THREE.Matrix4;
      rotation: THREE.Matrix4;
    } {
      const translationComponents = transformationData.translation.split(' ').map(parseFloat);
      const milimetersInMeters = 1000;
      const translation = new THREE.Vector3(
        translationComponents[0],
        translationComponents[2],
        -translationComponents[1]
      ).divideScalar(milimetersInMeters);
      const rotationAxisComponents = transformationData.rotation_axis.split(' ').map(parseFloat);
      const rotationAxis = new THREE.Vector3(
        rotationAxisComponents[0],
        rotationAxisComponents[2],
        -rotationAxisComponents[1]
      );
      const rotationAngle = THREE.MathUtils.DEG2RAD * parseFloat(transformationData.rotation_angle);
      const rotationMatrix = new THREE.Matrix4().makeRotationAxis(rotationAxis, rotationAngle);

      const translationMatrix = new THREE.Matrix4().makeTranslation(translation.x, translation.y, translation.z);

      return { translation: translationMatrix, rotation: rotationMatrix };
    }
  }

  public async get360ImageFaces(): Promise<void> {}
}
